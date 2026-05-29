import { useState, useEffect } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { Topbar } from './components/layout/Topbar'
import { CommandPalette } from './components/layout/CommandPalette'
import { DashboardPage } from './pages/DashboardPage'
import { AuthProvider, useAuth } from './context/AuthContext'
import { UserLoginPage } from './pages/auth/UserLoginPage'
import { AdminLoginPage } from './pages/auth/AdminLoginPage'
import { UserSignupPage } from './pages/auth/UserSignupPage'
import { ProfileSetupPage } from './pages/auth/ProfileSetupPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'

/**
 * AppContent – contains state and handles routing based on auth and hash changes
 */
function AppContent() {
  const { user, loading } = useAuth()
  const [currentPath, setCurrentPath] = useState(window.location.hash || '#/login')
  const [theme, setTheme] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  )
  const [query, setQuery] = useState('')
  const [commandOpen, setCommandOpen] = useState(false)

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash || '#/login')
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  if (loading) {
    return (
      <div data-theme={theme} className="app-theme bg-basebg text-textmain min-h-screen flex items-center justify-center font-body">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-textmuted">Initializing HirePulse...</p>
        </div>
      </div>
    )
  }

  // --- Auth Guards ---
  if (!user) {
    if (currentPath === '#/admin/login') {
      return (
        <div data-theme={theme} className="app-theme bg-basebg text-textmain min-h-screen font-body">
          <AdminLoginPage />
        </div>
      )
    }
    if (currentPath === '#/signup') {
      return (
        <div data-theme={theme} className="app-theme bg-basebg text-textmain min-h-screen font-body">
          <UserSignupPage />
        </div>
      )
    }
    // Default to User Login
    if (window.location.hash !== '#/login') {
      window.location.hash = '#/login'
    }
    return (
      <div data-theme={theme} className="app-theme bg-basebg text-textmain min-h-screen font-body">
        <UserLoginPage />
      </div>
    )
  }

  // User is logged in but hasn't completed profile wizard
  if (user.role === 'user' && !user.isSetupCompleted) {
    if (window.location.hash !== '#/setup-profile') {
      window.location.hash = '#/setup-profile'
    }
    return (
      <div data-theme={theme} className="app-theme bg-basebg text-textmain min-h-screen font-body">
        <ProfileSetupPage />
      </div>
    )
  }

  // User is logged in and setup is completed (or Admin).
  // Redirect away from login / signup / setup pages to dashboard.
  const isAuthPath = ['#/login', '#/admin/login', '#/signup', '#/setup-profile'].includes(currentPath)
  if (isAuthPath) {
    window.location.hash = user.role === 'admin' ? '#/admin/students' : '#/dashboard'
  }

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
            {user.role === 'admin' ? (
              <AdminDashboardPage currentTab={currentPath === '#/admin/jobs' ? 'jobs' : 'students'} />
            ) : (
              <DashboardPage query={query} />
            )}
          </main>
        </div>
      </div>

      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  )
}

/**
 * Root App – wraps content with AuthProvider
 */
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
