const Job = require('../models/Job');
const SourceHealth = require('../models/SourceHealth');

/**
 * POST /api/n8n/ingest
 * 
 * Accepts a batch of scraped jobs from an n8n workflow and upserts them into MongoDB.
 * Also auto-updates the SourceHealth record for the originating scraper.
 * 
 * Expected request body:
 * {
 *   "sourceWorkflow": "naukri-scraper",  // Unique n8n workflow / scraper identifier
 *   "jobs": [                            // Array of job objects (or single job object)
 *     {
 *       "title": "Senior React Developer",
 *       "company": "Infosys",
 *       "location": "Bangalore, India",
 *       "remote": "Hybrid",
 *       "experience": "experienced",
 *       "salary": "₹20–30 LPA",
 *       "tags": ["React", "TypeScript"],
 *       "url": "https://naukri.com/job/12345",   // Used for deduplication
 *       "description": "Full JD text...",
 *       "posted": "2 hours ago"
 *     }
 *   ]
 * }
 * 
 * Deduplication Strategy:
 *   - Primary: job URL (if provided) — most reliable
 *   - Fallback: title + company fingerprint (case-insensitive)
 */
exports.ingestJobs = async (req, res) => {
  try {
    const { sourceWorkflow, jobs: rawJobs } = req.body;

    if (!rawJobs) {
      return res.status(400).json({ error: 'Request body must include a "jobs" array.' });
    }

    // Accept single job object OR array
    const jobsArray = Array.isArray(rawJobs) ? rawJobs : [rawJobs];

    if (jobsArray.length === 0) {
      return res.status(400).json({ error: '"jobs" array must not be empty.' });
    }

    const workflow = sourceWorkflow || 'n8n-unknown';
    const scrapedAt = new Date();
    const results = { inserted: 0, updated: 0, errors: [] };

    for (const jobData of jobsArray) {
      try {
        const { title, company, url, description, location, remote, experience, salary, tags, posted, deadline } = jobData;

        if (!title || !company) {
          results.errors.push({ job: title || '(untitled)', error: 'Missing required fields: title and company.' });
          continue;
        }

        // --- Build dedup query ---
        let dedupQuery;
        if (url && url.trim()) {
          // Primary: match by URL
          dedupQuery = { url: url.trim() };
        } else {
          // Fallback: match by title + company (case-insensitive)
          dedupQuery = {
            title: { $regex: `^${escapeRegex(title.trim())}$`, $options: 'i' },
            company: { $regex: `^${escapeRegex(company.trim())}$`, $options: 'i' }
          };
        }

        // --- Build update payload ---
        const updateData = {
          title: title.trim(),
          company: company.trim(),
          location: location || 'Remote',
          remote: remote || 'Remote',
          experience: experience || 'experienced',
          salary: salary || 'Competitive',
          tags: Array.isArray(tags) ? tags : [],
          source: workflow,
          sourceWorkflow: workflow,
          url: url ? url.trim() : null,
          description: description || null,
          posted: posted || 'Just now',
          scrapedAt,
          isRecent: true,
          isActive: true,
          freshness: 100,
          match: 85, // Default match score; can be enhanced with AI scoring later
        };

        if (deadline) {
          updateData.deadline = new Date(deadline);
        }

        // --- Upsert ---
        const existing = await Job.findOne(dedupQuery);
        if (existing) {
          await Job.findByIdAndUpdate(existing._id, { $set: updateData });
          results.updated++;
        } else {
          const newJob = new Job(updateData);
          await newJob.save();
          results.inserted++;
        }
      } catch (jobErr) {
        console.error(`[n8n ingest] Error processing job "${jobData?.title}":`, jobErr.message);
        results.errors.push({ job: jobData?.title || '(untitled)', error: jobErr.message });
      }
    }

    // --- Auto-update SourceHealth for this scraper ---
    await upsertSourceHealth(workflow, jobsArray.length - results.errors.length, scrapedAt);

    // --- Mark stale jobs from this workflow ---
    // Jobs from this workflow that were NOT updated/inserted in this run are now potentially stale.
    // We flag them if scrapedAt is older than 48 hours.
    await markStaleJobs(workflow, scrapedAt);

    const totalProcessed = results.inserted + results.updated;
    console.log(`[n8n ingest] ${workflow}: ${results.inserted} inserted, ${results.updated} updated, ${results.errors.length} errors.`);

    return res.status(200).json({
      message: `Ingest complete for workflow: ${workflow}`,
      inserted: results.inserted,
      updated: results.updated,
      errored: results.errors.length,
      errors: results.errors.length > 0 ? results.errors : undefined,
      totalProcessed,
    });
  } catch (err) {
    console.error('[n8n ingest] Fatal error:', err);
    return res.status(500).json({ error: 'Server error during job ingest.', detail: err.message });
  }
};

/**
 * POST /api/n8n/mark-stale
 * Manually mark all jobs from a workflow as inactive.
 * Useful when a scraper detects a job listing has been removed.
 */
exports.markJobsStale = async (req, res) => {
  try {
    const { sourceWorkflow, urls } = req.body;

    if (!sourceWorkflow) {
      return res.status(400).json({ error: 'sourceWorkflow is required.' });
    }

    let filter = { sourceWorkflow };
    if (urls && Array.isArray(urls) && urls.length > 0) {
      filter = { url: { $in: urls } };
    }

    const result = await Job.updateMany(filter, { $set: { isActive: false } });
    
    return res.status(200).json({
      message: `Marked ${result.modifiedCount} jobs as inactive.`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error('[n8n mark-stale] Error:', err);
    return res.status(500).json({ error: 'Server error marking jobs stale.' });
  }
};

/**
 * GET /api/n8n/sources
 * Returns list of connected n8n scraper sources and their last ingest stats.
 * Used by frontend SourceHealthSection to show n8n-specific badges.
 */
exports.getSources = async (req, res) => {
  try {
    // Aggregate unique sourceWorkflows from jobs
    const sources = await Job.aggregate([
      { $match: { sourceWorkflow: { $ne: null } } },
      {
        $group: {
          _id: '$sourceWorkflow',
          totalJobs: { $sum: 1 },
          activeJobs: { $sum: { $cond: ['$isActive', 1, 0] } },
          lastScrapedAt: { $max: '$scrapedAt' },
        }
      },
      { $sort: { lastScrapedAt: -1 } }
    ]);

    return res.status(200).json(sources.map(s => ({
      workflow: s._id,
      totalJobs: s.totalJobs,
      activeJobs: s.activeJobs,
      lastScrapedAt: s.lastScrapedAt,
    })));
  } catch (err) {
    console.error('[n8n sources] Error:', err);
    return res.status(500).json({ error: 'Server error fetching n8n sources.' });
  }
};

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Upsert a SourceHealth record for the n8n workflow.
 */
async function upsertSourceHealth(workflow, recordCount, scrapedAt) {
  try {
    const minutesAgo = Math.floor((Date.now() - scrapedAt.getTime()) / 60000);
    const freshnessLabel = minutesAgo < 1 ? 'Just now' : `${minutesAgo}m ago`;

    await SourceHealth.findOneAndUpdate(
      { source: workflow },
      {
        $set: {
          source: workflow,
          status: 'Healthy',
          freshness: freshnessLabel,
          records: recordCount,
          confidence: 'High',
          lastIngestedAt: scrapedAt,
        }
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error('[n8n ingest] Failed to update SourceHealth:', err.message);
  }
}

/**
 * Mark jobs from a workflow as stale if they were last scraped before this run.
 * A job is considered stale if its scrapedAt is NOT the current ingest time,
 * meaning it was not refreshed in this run.
 * Uses a 48h grace window to avoid marking manually-added jobs as stale.
 */
async function markStaleJobs(workflow, currentRunAt) {
  try {
    const staleThreshold = new Date(currentRunAt.getTime() - 48 * 60 * 60 * 1000);
    await Job.updateMany(
      {
        sourceWorkflow: workflow,
        isActive: true,
        scrapedAt: { $lt: staleThreshold }
      },
      { $set: { isActive: false } }
    );
  } catch (err) {
    console.error('[n8n ingest] Failed to mark stale jobs:', err.message);
  }
}

/**
 * Escape special regex characters in a string for safe use in $regex queries.
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
