import { useState, useEffect } from 'react'
import {
  BriefcaseBusiness, Sparkles, Building2, BellRing, Building,
  LayoutDashboard, Layers
} from 'lucide-react'
import { Badge, MatchBar, Panel } from '../components/ui'
import { JobFeedSection } from './JobFeedSection'
import { CompaniesSection } from './CompaniesSection'
import { AlertsSection } from './AlertsSection'
import { SavedSearchesSection } from './SavedSearchesSection'
import { fetchStats } from '../utils/api'

/**
 * Tabbed Dashboard Page – Hero, KPI strip, and hash-synced tabbed workspace.
 * @param {{ query: string }} props - Global search string forwarded to JobFeedSection.
 */
export function DashboardPage({ query }) {
  const [stats, setStats] = useState(null)
  
  // Tab State hash sync (jobs, companies, alerts, saved, all)
  const getTabFromHash = () => {
    const hash = window.location.hash || '#dashboard'
    if (hash.includes('#jobs') || hash.includes('#/jobs')) return 'jobs'
    if (hash.includes('#companies') || hash.includes('#/companies')) return 'companies'
    if (hash.includes('#alerts') || hash.includes('#/alerts')) return 'alerts'
    if (hash.includes('#saved') || hash.includes('#/saved')) return 'saved'
    return 'all' // Default on opening dashboard is All Sections View
  }

  const [activeTab, setActiveTab] = useState(getTabFromHash)

  useEffect(() => {
    const handleHash = () => {
      setActiveTab(getTabFromHash())
    }
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

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

  const switchTab = (tabId, hash) => {
    setActiveTab(tabId)
    if (hash) {
      window.location.hash = hash
    }
  }

  const KPI_CARDS = [
    ['New jobs today',    stats?.newJobsToday || '148',  'Across Greenhouse, Lever, RemoteOK, Ashby, and career pages.', BriefcaseBusiness],
    ['High-fit matches',  stats?.highFitMatches || '34',   'AI scoring over 85% based on role, stack, and recency.',               Sparkles],
    ['Watched companies', stats?.watchedCompanies || '62',   'Prioritized software, cloud, fintech, SaaS, and platform teams.',      Building2],
  ]

  const TABS = [
    { id: 'all', label: 'All Sections View', icon: Layers, hash: '#dashboard' },
    { id: 'jobs', label: 'Job Feed', icon: BriefcaseBusiness, hash: '#jobs', badge: stats?.newJobsToday || '148' },
    { id: 'companies', label: 'Tracked Companies', icon: Building2, hash: '#companies', badge: stats?.watchedCompanies || '62' },
    { id: 'alerts', label: 'Alerts & Signals', icon: BellRing, hash: '#alerts', badge: '3' },
    { id: 'saved', label: 'Saved Searches', icon: Building, hash: '#saved' },
  ]

  return (
    <div className="page-wrap px-4 lg:px-8 py-6 lg:py-8 space-y-6">
      {/* Hero */}
      <section className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge><BriefcaseBusiness size={14} />Live monitoring</Badge>
            <Badge tone="success">Active feed</Badge>
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

      {/* --- TAB NAVIGATION BAR --- */}
      <div className="border-b border-border/80 pt-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-px">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => switchTab(tab.id, tab.hash)}
                className={`flex items-center gap-2 px-4 py-3 font-display font-semibold text-sm rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-primary text-primary bg-primary/5 shadow-sm'
                    : 'border-transparent text-textmuted hover:text-textmain hover:bg-surface-2/60'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-primary' : 'text-textmuted'} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-primary/20 text-primary' : 'bg-surface-2 text-textmuted border border-border/60'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* --- TABBED CONTENT VIEWS --- */}
      <div className="transition-all duration-200">
        {activeTab === 'jobs' && (
          <div className="max-w-5xl mx-auto">
            <JobFeedSection query={query} />
          </div>
        )}

        {activeTab === 'companies' && (
          <div className="max-w-5xl mx-auto">
            <CompaniesSection />
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="max-w-4xl mx-auto">
            <AlertsSection />
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="max-w-4xl mx-auto">
            <SavedSearchesSection />
          </div>
        )}

        {/* All Sections Overview Grid */}
        {activeTab === 'all' && (
          <section className="grid-main">
            <div className="space-y-6">
              <JobFeedSection query={query} />
            </div>

            <aside className="space-y-6">
              <CompaniesSection />
              <AlertsSection />
              <SavedSearchesSection />
            </aside>
          </section>
        )}
      </div>

    </div>
  )
}
