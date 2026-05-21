import { useState, useEffect } from 'react'
import { Badge, LogoMark, Panel } from '../components/ui'
import { fetchCompanies } from '../utils/api'

/** Grid of tracked companies with open role counts. */
export function CompaniesSection() {
  const [companies, setCompanies] = useState([])
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

  return (
    <Panel className="p-5" id="companies">
      <div className="mb-4">
        <h2 className="font-display text-xl font-semibold">Tracked companies</h2>
        <p className="text-sm text-textmuted">Priority list for product, cloud, and developer tooling roles.</p>
      </div>

      <div className="companies-grid">
        {loading ? (
          <div className="p-4 text-center text-textmuted">Loading...</div>
        ) : error ? (
          <div className="p-4 text-center text-error">{error}</div>
        ) : (
          companies.map((company) => (
            <article key={company.id} className="company-card p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <LogoMark className="text-sm font-semibold">{company.logo}</LogoMark>
                <Badge>{company.open} open</Badge>
              </div>
              <h3 className="font-semibold">{company.name}</h3>
              <p className="text-sm mt-1 text-textmuted">{company.location}</p>
              <p className="text-sm mt-3 text-textmuted">{company.focus}</p>
              <div className="mt-4">
                <button className="btn w-full">Watch</button>
              </div>
            </article>
          ))
        )}
      </div>
    </Panel>
  )
}
