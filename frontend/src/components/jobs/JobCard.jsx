import { BookmarkPlus } from 'lucide-react'
import { Badge, Chip, LogoMark, MatchBar } from '../ui'
import { initials } from '../../utils/helpers'

/** Renders a single job listing card. */
export function JobCard({ job }) {
  return (
    <article className="job-card">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        {/* Left: company logo + job meta */}
        <div className="flex gap-4 min-w-0 flex-1">
          <LogoMark className="text-sm font-semibold">{initials(job.company)}</LogoMark>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg leading-tight">{job.title}</h3>
              {job.isRecent && <Badge tone="success">New</Badge>}
              <Badge>{job.source}</Badge>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-textmuted">
              <span>{job.company}</span><span>•</span>
              <span>{job.location}</span><span>•</span>
              <span>{job.salary}</span><span>•</span>
              <span>{job.posted}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {job.tags.map((tag) => <Chip key={tag}>{tag}</Chip>)}
            </div>
          </div>
        </div>

        {/* Right: AI match score + actions */}
        <div className="md:w-[220px] flex flex-col gap-3">
          <div className="surface-sub rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-textmuted">AI match</span>
              <span className="font-semibold">{job.match}%</span>
            </div>
            <MatchBar value={job.match} />
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary flex-1">Apply</button>
            <button className="btn" aria-label="Save job"><BookmarkPlus size={18} /></button>
          </div>
        </div>
      </div>
    </article>
  )
}
