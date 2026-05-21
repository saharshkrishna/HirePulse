import { Filter, Menu, Moon, Search, Sparkles, Sun } from 'lucide-react'

/**
 * @param {{ theme: string, onThemeToggle: () => void,
 *           query: string, onQueryChange: (v: string) => void,
 *           onCommandOpen: () => void }} props
 */
export function Topbar({ theme, onThemeToggle, query, onQueryChange, onCommandOpen }) {
  return (
    <header className="topbar">
      <div className="px-4 lg:px-8 py-4 flex items-center gap-3 justify-between">
        {/* Left: hamburger + search */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button className="btn btn-ghost mobile-nav" aria-label="Open navigation">
            <Menu size={18} />
          </button>
          <div className="relative w-full max-w-xl">
            {/* <Search className="search-icon" size={16} /> */}
            <input
              id="job-search"
              className="input w-full pl-20 pr-20"
              placeholder="Search role, skill, company, or location"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
            />
            <button className="command-trigger" onClick={onCommandOpen}>ctrl+K</button>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <button className="btn" onClick={onThemeToggle} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="btn">
            <Filter size={18} />
            <span className="hidden md:inline">Smart filters</span>
          </button>
          <button className="btn btn-primary">
            <Sparkles size={18} />
            <span className="hidden md:inline">Run AI scan</span>
          </button>
        </div>
      </div>
    </header>
  )
}
