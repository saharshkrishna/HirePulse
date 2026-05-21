import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { Badge, Panel } from '../components/ui'
import { fetchSourceHealth } from '../utils/api'

/** Displays connector reliability, freshness, and extraction confidence. */
export function SourceHealthSection() {
  const [sourceHealth, setSourceHealth] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadHealth = async () => {
    setLoading(true)
    try {
      const data = await fetchSourceHealth()
      setSourceHealth(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHealth()
  }, [])

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

      <div className="table-wrap">
        {loading && sourceHealth.length === 0 ? (
          <div className="p-8 text-center text-textmuted">Loading health status...</div>
        ) : error ? (
          <div className="p-8 text-center text-error">{error}</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Source</th>
                <th>Status</th>
                <th>Freshness</th>
                <th>Records</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {sourceHealth.map((item) => (
                <tr key={item.source}>
                  <td>{item.source}</td>
                  <td>
                    <Badge tone={item.status === 'Verify' ? 'warning' : 'success'}>{item.status}</Badge>
                  </td>
                  <td>{item.freshness}</td>
                  <td>{item.records}</td>
                  <td>{item.confidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Panel>
  )
}
