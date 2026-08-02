import { useState, useEffect } from 'react'
import { RefreshCw, Zap, Clock } from 'lucide-react'
import { Badge, Panel } from '../components/ui'
import { fetchSourceHealth } from '../utils/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

/** Displays connector reliability, freshness, and extraction confidence. */
export function SourceHealthSection() {
  const [sourceHealth, setSourceHealth] = useState([])
  const [n8nSources, setN8nSources] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadHealth = async () => {
    setLoading(true)
    try {
      const [healthData, n8nData] = await Promise.all([
        fetchSourceHealth(),
        fetch(`${API_BASE_URL}/n8n/sources`).then(r => r.ok ? r.json() : []).catch(() => [])
      ])
      setSourceHealth(healthData)
      setN8nSources(n8nData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHealth()
  }, [])

  const formatLastSeen = (dateStr) => {
    if (!dateStr) return 'Never'
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <Panel className="p-5" id="sources">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-xl font-semibold">Source health</h2>
          <p className="text-sm text-textmuted">Connector reliability, freshness, and extraction confidence.</p>
        </div>
        <button className="btn" onClick={loadHealth} disabled={loading}>
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* n8n Automated Sources */}
      {n8nSources.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={16} className="text-primary" />
            <span className="text-sm font-semibold text-primary">n8n Automated Scrapers</span>
            <Badge tone="primary">{n8nSources.length} connected</Badge>
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
            {n8nSources.map((src) => (
              <div key={src.workflow} className="surface-sub rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm truncate">{src.workflow}</span>
                  <Badge tone="success">Live</Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-textmuted">
                  <Clock size={11} />
                  <span>{formatLastSeen(src.lastScrapedAt)}</span>
                </div>
                <div className="text-xs text-textmuted">
                  {src.activeJobs} active / {src.totalJobs} total jobs
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Static / Manual Sources Table */}
      <div className="table-wrap overflow-x-auto">
        {loading && sourceHealth.length === 0 ? (
          <div className="space-y-3 p-4">
            <div className="h-8 w-full skeleton" />
            <div className="h-8 w-full skeleton" />
            <div className="h-8 w-full skeleton" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-error">{error}</div>
        ) : (
          <table className="w-full min-w-[500px]">
            <thead>
              <tr>
                <th>Source</th>
                <th>Status</th>
                <th>Freshness</th>
                <th>Records</th>
                <th>Confidence</th>
                <th>Last Ingest</th>
              </tr>
            </thead>
            <tbody>
              {sourceHealth.map((item, idx) => (
                <tr key={item.source || idx}>
                  <td className="font-semibold">
                    <div className="flex items-center gap-2">
                      {item.source}
                      {item.lastIngestedAt && (
                        <Badge tone="primary" title="Auto-updated by n8n">⚡ n8n</Badge>
                      )}
                    </div>
                  </td>
                  <td>
                    <Badge tone={item.status === 'Verify' ? 'warning' : 'success'}>{item.status}</Badge>
                  </td>
                  <td className="text-textmuted">{item.freshness}</td>
                  <td>{item.records}</td>
                  <td className="font-mono">{item.confidence}</td>
                  <td className="text-textmuted text-xs">
                    {item.lastIngestedAt ? formatLastSeen(item.lastIngestedAt) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Panel>
  )
}

