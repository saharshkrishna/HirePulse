import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge, LogoMark, Panel } from '../components/ui'
import { fetchCompanies } from '../utils/api'

const COMPANIES_PER_PAGE = 6

/** Grid of tracked companies with open role counts and pagination (6 per page). */
export function CompaniesSection() {
  const [companies, setCompanies] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadCompanies = async () => {
      setLoading(true)
      try {
        const data = await fetchCompanies()
        setCompanies(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadCompanies()
  }, [])

  const totalPages = Math.ceil(companies.length / COMPANIES_PER_PAGE) || 1
  const paginatedCompanies = companies.slice((page - 1) * COMPANIES_PER_PAGE, page * COMPANIES_PER_PAGE)

  return (
    <Panel className="p-5" id="companies">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-xl font-semibold">Tracked companies</h2>
          <p className="text-sm text-textmuted">Priority list for product, cloud, and developer tooling roles.</p>
        </div>
        {companies.length > 0 && (
          <Badge tone="primary">{companies.length} Total</Badge>
        )}
      </div>

      <div className="companies-grid">
        {loading ? (
          <div className="p-4 text-center text-textmuted">Loading companies...</div>
        ) : error ? (
          <div className="p-4 text-center text-error">{error}</div>
        ) : (
          paginatedCompanies.map((company) => (
            <article key={company.id || company._id || company.name} className="company-card p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <LogoMark className="text-sm font-semibold">{company.logo || company.name.substring(0, 2).toUpperCase()}</LogoMark>
                <Badge>{company.open ?? 5} open</Badge>
              </div>
              <h3 className="font-semibold">{company.name}</h3>
              <p className="text-sm mt-1 text-textmuted">{company.location}</p>
              <p className="text-sm mt-3 text-textmuted">{company.focus || 'Software & Tech'}</p>
              <div className="mt-4">
                <button className="btn w-full">Watch</button>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Pagination Bar for Companies */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/60">
          <button
            type="button"
            className="btn flex items-center gap-1 text-xs font-semibold disabled:opacity-40 cursor-pointer"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page <= 1 || loading}
          >
            <ChevronLeft size={14} />
            Previous
          </button>

          <span className="text-xs text-textmuted font-medium">
            Page <strong className="text-textmain font-semibold">{page}</strong> of <strong className="text-textmain font-semibold">{totalPages}</strong>
          </span>

          <button
            type="button"
            className="btn flex items-center gap-1 text-xs font-semibold disabled:opacity-40 cursor-pointer"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page >= totalPages || loading}
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </Panel>
  )
}

