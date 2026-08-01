import { SearchX } from 'lucide-react'
import { LogoMark, Panel } from '../components/ui'
import { JobCard } from '../components/jobs/JobCard'
import { JobFilters } from '../components/jobs/JobFilters'
import { useJobFilter } from '../hooks/useJobFilter'

/**
 * Full job-feed panel including filters and the scrollable list of cards.
 * @param {{ query: string }} props - Global search query from App-level state.
 */
export function JobFeedSection({ query }) {
  const {
    role, setRole,
    remote, setRemote,
    experience, setExperience,
    sortBy, setSortBy,
    filteredJobs,
    loading,
    error
  } = useJobFilter(query)

  return (
    <Panel className="p-5" id="jobs">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-5">
        <div>
          <h2 className="font-display text-xl font-semibold">Job feed</h2>
          <p className="text-sm text-textmuted">Normalized and deduplicated opportunities ranked by fit.</p>
        </div>
        <JobFilters
          role={role} onRole={setRole}
          remote={remote} onRemote={setRemote}
          experience={experience} onExperience={setExperience}
          sortBy={sortBy} onSortBy={setSortBy}
        />
      </div>

      <div className="jobs-grid">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="job-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-5 w-40 skeleton" />
                <div className="h-5 w-16 skeleton rounded-full" />
              </div>
              <div className="h-4 w-28 skeleton" />
              <div className="flex gap-2 pt-2">
                <div className="h-6 w-16 skeleton rounded-full" />
                <div className="h-6 w-20 skeleton rounded-full" />
                <div className="h-6 w-16 skeleton rounded-full" />
              </div>
            </div>
          ))
        ) : error ? (
          <div className="p-8 text-center text-error">Error: {error}</div>
        ) : filteredJobs.length ? (
          filteredJobs.map((job) => <JobCard key={job.id || job._id} job={job} />)
        ) : (
          <div className="surface-sub rounded-3xl p-8 text-center">
            <LogoMark className="mx-auto mb-4"><SearchX size={18} /></LogoMark>
            <h3 className="font-semibold text-lg">No jobs match the current filters</h3>
            <p className="text-sm mt-2 text-textmuted">Adjust role, location, or search terms to widen the feed.</p>
          </div>
        )}
      </div>
    </Panel>
  )
}
