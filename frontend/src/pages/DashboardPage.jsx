import { useState, useEffect } from 'react'
import { BriefcaseBusiness, Radar, Sparkles, Building2 } from 'lucide-react'
import { Badge, MatchBar, Panel } from '../components/ui'
import { JobFeedSection } from './JobFeedSection'
import { SourceHealthSection } from './SourceHealthSection'
import { CompaniesSection } from './CompaniesSection'
import { AlertsSection } from './AlertsSection'
import { SavedSearchesSection } from './SavedSearchesSection'
import { fetchStats } from '../utils/api'

/**
 * Primary dashboard page – hero, KPI strip, and two-column content layout.
 * @param {{ query: string }} props - Global search string forwarded to JobFeedSection.
 */
export function DashboardPage({ query }) {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchStats()
        setStats(data)
      } catch (err) {
        console.error('Failed to load stats', err)
      }
    }
    loadStats()
  }, [])

  const KPI_CARDS = [
    ['New jobs today',    stats?.newJobsToday || '...',  'Across Greenhouse, Lever, RemoteOK, Ashby, and direct career pages.', BriefcaseBusiness],
    ['High-fit matches',  stats?.highFitMatches || '...',   'AI scoring over 85% based on role, stack, and recency.',               Sparkles],
    ['Watched companies', stats?.watchedCompanies || '...',   'Prioritized software, cloud, fintech, SaaS, and platform teams.',      Building2],
    ['Healthy sources',   stats?.healthySources || '...',  'Crawl reliability over the last 24 hours with retry protection.',      Radar],
  ]

  return (
    <div className="page-wrap px-4 lg:px-8 py-6 lg:py-8 space-y-6">
      {/* Hero */}
      <section className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge><Radar size={14} />Live monitoring</Badge>
            <Badge tone="success">{stats?.healthySources ? '12 sources healthy' : 'Checking sources...'}</Badge>
          </div>
          <h1 className="hero-title font-display font-semibold tracking-tight">
            Find every serious IT hiring signal in one focused workspace.
          </h1>
          <p className="mt-3 max-w-3xl text-textmuted">
            Track company career pages, ATS job boards, and remote platforms through one AI-assisted
            feed built for software engineers, developers, testers, and platform teams.
          </p>
        </div>
        <Panel className="p-4 min-w-[280px]">
          <div className="text-sm text-textmuted mb-2">Match quality</div>
          <div className="flex items-end justify-between gap-3 mb-2">
            <div className="font-display text-3xl font-semibold">89.4%</div>
            <div className="text-sm text-success">+6.2% vs last week</div>
          </div>
          <MatchBar value={89.4} />
        </Panel>
      </section>

      {/* KPI strip */}
      <section className="grid-kpis">
        {KPI_CARDS.map(([label, value, desc, Icon]) => (
          <article key={label} className="panel p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-textmuted">{label}</span>
              <Icon size={16} />
            </div>
            <div className="font-display text-3xl font-semibold">{value}</div>
            <p className="text-sm mt-2 text-textmuted">{desc}</p>
          </article>
        ))}
      </section>

      {/* Two-column content grid */}
      <section className="grid-main">
        {/* Left column */}
        <div className="space-y-6">
          <JobFeedSection query={query} />
          <SourceHealthSection />
        </div>

        {/* Right column */}
        <aside className="space-y-6">
          <CompaniesSection />
          <AlertsSection />
          <SavedSearchesSection />
        </aside>
      </section>
    </div>
  )
}
