import { useState } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { Topbar } from './components/layout/Topbar'
import { CommandPalette } from './components/layout/CommandPalette'
import { DashboardPage } from './pages/DashboardPage'

/**
 * App – thin shell that owns only cross-cutting state:
 *   • theme  (light / dark)
 *   • global search query (passed to Topbar; consumed by JobFeedSection via hook)
 *   • commandOpen overlay flag
 */
export default function App() {
  const [theme, setTheme] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  )
  const [query, setQuery] = useState('')
  const [commandOpen, setCommandOpen] = useState(false)

  return (
    <div data-theme={theme} className="app-theme bg-basebg text-textmain min-h-screen font-body">
      <div className="app-shell">
        <Sidebar />

        <div>
          <Topbar
            theme={theme}
            onThemeToggle={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            query={query}
            onQueryChange={setQuery}
            onCommandOpen={() => setCommandOpen(true)}
          />

          <main className="scroll-region">
            <DashboardPage query={query} />
          </main>
        </div>
      </div>

      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  )
}
