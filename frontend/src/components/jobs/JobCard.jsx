import React, { useState } from 'react'
import { BookmarkPlus, ExternalLink, CheckCircle2, Send, Loader2 } from 'lucide-react'
import { Badge, Chip, LogoMark, MatchBar } from '../ui'
import { initials } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'

/** Renders a single job listing card. */
export function JobCard({ job }) {
  const { user, updateProfileDB } = useAuth()
  const [isApplying, setIsApplying] = useState(false)
  const [notification, setNotification] = useState('')

  const matchScore = job.match ?? 90
  const tagsList = Array.isArray(job.tags) ? job.tags : []
  const postedText = job.posted || (job.createdAt ? 'Recently added' : 'Active')
  const sourceText = job.source || job.sourceWorkflow || 'HirePulse'
  const hasUrl = job.url && job.url.trim()

  const appliedJobs = user?.appliedJobs || user?.profileDetails?.appliedJobs || []
  const isApplied = appliedJobs.some(a => 
    (a.jobId && String(a.jobId) === String(job.id || job._id)) ||
    (a.title?.toLowerCase() === job.title?.toLowerCase() && a.company?.toLowerCase() === job.company?.toLowerCase())
  )

  const handleApply = async () => {
    if (!user) {
      window.location.hash = '#/login'
      return
    }

    if (isApplied || isApplying) return

    const newApplication = {
      id: Date.now(),
      jobId: job.id || job._id,
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary || 'Competitive',
      appliedDate: 'Applied Just Now',
      status: 'Under Review',
      statusTone: 'primary',
      matchScore: matchScore,
      source: sourceText
    }

    const updatedAppliedJobs = [newApplication, ...appliedJobs]

    try {
      setIsApplying(true)
      await updateProfileDB({ appliedJobs: updatedAppliedJobs })
      if (hasUrl) {
        window.open(job.url, '_blank', 'noopener,noreferrer')
      }
      setNotification(`🎉 Applied! Saved to your Profile > Applied Jobs.`)
      setTimeout(() => setNotification(''), 4000)
    } catch (err) {
      console.error('Failed to apply for job:', err)
      setNotification(`Failed to apply: ${err.message}`)
      setTimeout(() => setNotification(''), 4000)
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <article className="job-card relative">
      {notification && (
        <div className="absolute top-2 right-2 z-10 bg-primary text-white text-xs px-3 py-1 rounded-lg shadow-md flex items-center gap-1.5 animate-in fade-in">
          <span>{notification}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        {/* Left: company logo + job meta */}
        <div className="flex gap-4 min-w-0 flex-1">
          <LogoMark className="text-sm font-semibold">{initials(job.company || 'Job')}</LogoMark>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg leading-tight">{job.title}</h3>
              {job.isRecent && <Badge tone="success">New</Badge>}
              {job.deadline && (() => {
                const diffMs = new Date(job.deadline).getTime() - Date.now();
                const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                if (diffDays <= 0) {
                  return <Badge tone="warning">Expiring today</Badge>;
                } else if (diffDays <= 3) {
                  return <Badge tone="warning">Expires in {diffDays}d</Badge>;
                } else {
                  return <Badge tone="primary">Deadline: {new Date(job.deadline).toLocaleDateString()}</Badge>;
                }
              })()}
              {!job.isActive && (
                <Badge tone="warning">Inactive</Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-textmuted">
              <span>{job.company}</span><span>•</span>
              <span>{job.location}</span><span>•</span>
              <span>{job.salary}</span><span>•</span>
              <span>{postedText}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {tagsList.map((tag, idx) => <Chip key={tag + idx}>{tag}</Chip>)}
            </div>
          </div>
        </div>

        {/* Right: AI match score + actions */}
        <div className="md:w-[220px] flex flex-col gap-3">
          <div className="surface-sub rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-textmuted">Role match</span>
              <span className="font-semibold">{matchScore}%</span>
            </div>
            <MatchBar value={matchScore} />
          </div>
          <div className="flex gap-2">
            {isApplied ? (
              <div className="flex-1 px-3 py-2 text-xs font-semibold rounded-xl bg-success/15 text-success border border-success/30 flex items-center justify-center gap-1.5">
                <CheckCircle2 size={15} /> Applied
              </div>
            ) : isApplying ? (
              <button disabled className="btn btn-primary flex-1 opacity-70 cursor-wait flex items-center justify-center gap-1">
                <Loader2 size={14} className="animate-spin" /> Applying...
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApply}
                className="btn btn-primary flex-1 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Apply {hasUrl ? <ExternalLink size={14} /> : <Send size={14} />}
              </button>
            )}
            <button className="btn" aria-label="Save job"><BookmarkPlus size={18} /></button>
          </div>
        </div>
      </div>
    </article>
  )
}
