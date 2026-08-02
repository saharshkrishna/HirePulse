import {
  BellRing, BriefcaseBusiness, Building, Building2,
  LayoutDashboard, Radar, Settings2, LogOut, GraduationCap, User, X
} from 'lucide-react'
import { Badge, Chip, LogoMark, Panel } from '../ui'
import { useAuth } from '../../context/AuthContext'
import { useEffect, useState } from 'react'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '#dashboard' },
  { label: 'Profile & Skills', icon: User, href: '#profile' },
  { label: 'Job feed', icon: BriefcaseBusiness, href: '#jobs' },
  { label: 'Companies', icon: Building2, href: '#companies' },
  { label: 'Alerts', icon: BellRing, href: '#alerts' },
  { label: 'Saved jobs', icon: Building, href: '#saved' },
  { label: 'Preferences', icon: Settings2, href: '#settings' },
]

const adminNavItems = [
  { label: 'Students', icon: GraduationCap, href: '#/admin/students' },
  { label: 'Manage Jobs', icon: BriefcaseBusiness, href: '#/admin/jobs' },
]

export function Sidebar({ onMobileClose, isMobileDrawer = false }) {
  const { user, logout } = useAuth()
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#dashboard')

  useEffect(() => {
    const handleHash = () => {
      setCurrentHash(window.location.hash || '#dashboard')
    }
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  const activeItems = user?.role === 'admin' ? adminNavItems : navItems

  return (
    <aside className={isMobileDrawer ? "mobile-drawer" : "sidebar flex flex-col justify-between h-screen pb-4"}>
      <div>
        {/* Brand */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <LogoMark>
              <svg viewBox="0 0 48 48" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.8" aria-label="HirePulse logo">
                <path d="M10 30c4-10 10-16 14-16s8 5 8 10-3 10-8 10-6-2-10-2" strokeLinecap="round" />
                <path d="M28 15l9-6" strokeLinecap="round" />
                <circle cx="39" cy="9" r="3" fill="currentColor" stroke="none" />
              </svg>
            </LogoMark>
            <div>
              <div className="font-display text-lg font-semibold leading-none">HirePulse</div>
              <div className="text-sm text-textmuted">AI hiring intelligence</div>
            </div>
          </div>
          {isMobileDrawer && (
            <button 
              onClick={onMobileClose}
              className="p-2 rounded-lg bg-surface-2 border border-border text-textmuted hover:text-textmain"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* User Session Profile Box (Top position) */}
        {user && (
          <div className="mb-6 flex items-center justify-between gap-3 bg-surface p-3 rounded-xl shadow-sm border border-border/80 hover:border-primary/50 transition-all group">
            <a 
              href={user.role === 'admin' ? '#/admin/students' : '#profile'} 
              onClick={() => isMobileDrawer && onMobileClose && onMobileClose()}
              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer no-underline text-inherit"
              title="View Profile & Skills"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 group-hover:scale-105 transition-transform ${
                user.role === 'admin' ? 'bg-warning/15 text-warning border border-warning/20' : 'bg-primary/15 text-primary border border-primary/20'
              }`}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-display font-semibold text-sm truncate leading-tight group-hover:text-primary transition-colors">
                  {user.name}
                </div>
                <div className="text-xs text-textmuted capitalize mt-0.5 truncate font-medium flex items-center gap-1">
                  {user.role === 'admin' ? 'System Admin' : user.profileType || 'Candidate'}
                </div>
              </div>
            </a>
            <button
              onClick={(e) => {
                e.stopPropagation()
                logout()
                if (onMobileClose) onMobileClose()
                window.location.hash = '#/login'
              }}
              title="Log out"
              className="p-2 rounded-lg bg-surface-2 border border-border hover:bg-warning/10 hover:text-warning hover:border-warning/30 text-textmuted transition-all cursor-pointer flex-shrink-0"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}

        {/* Nav */}
        <nav className="space-y-1">
          {activeItems.map(({ label, icon: Icon, href }) => {
            const isActive = currentHash === href || 
              (href === '#dashboard' && currentHash === '#/dashboard') ||
              (href === '#profile' && (currentHash === '#profile' || currentHash === '#/profile')) ||
              (href === '#/admin/students' && currentHash === '#/dashboard')
            
            return (
              <a 
                key={label} 
                href={href} 
                onClick={() => isMobileDrawer && onMobileClose && onMobileClose()}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </a>
            )
          })}
        </nav>

        {/* Today summary */}
        <Panel className="mt-4 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display text-base font-semibold">Today</h2>
            <span className="text-xs text-textmuted">Updated 10m ago</span>
          </div>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3"><span className="status-dot" />14 new jobs matched your preferences</li>
            <li className="flex items-start gap-3"><span className="status-dot" />3 companies switched to active hiring mode</li>
            <li className="flex items-start gap-3"><span className="status-dot" />2 source connectors require verification</li>
          </ul>
        </Panel>
      </div>
    </aside>
  )
}
