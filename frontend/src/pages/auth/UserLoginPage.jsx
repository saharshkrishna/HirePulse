import React, { useState } from 'react'
import { Mail, Lock, ArrowRight, Shield, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function UserLoginPage() {
  const { loginUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      await loginUser(email, password)
      window.location.hash = '#/dashboard'
    } catch (err) {
      setError(err.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-basebg px-4 py-12 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-success/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="panel max-w-md w-full p-8 space-y-8 backdrop-blur-md relative z-10">
        <div className="text-center">
          {/* Logo Mark */}
          <div className="logo-mark mx-auto mb-4">
            <svg viewBox="0 0 48 48" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.8">
              <path d="M10 30c4-10 10-16 14-16s8 5 8 10-3 10-8 10-6-2-10-2" strokeLinecap="round" />
              <path d="M28 15l9-6" strokeLinecap="round" />
              <circle cx="39" cy="9" r="3" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Welcome to HirePulse</h2>
          <p className="text-sm text-textmuted mt-2">
            AI-powered intelligence for software talent & careers
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-warning bg-warning/10 p-3 rounded-lg border border-warning/20 text-sm">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Demo Credentials Card */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between font-semibold text-primary">
            <span>💡 Demo Candidate Account</span>
            <button
              type="button"
              onClick={() => {
                setEmail('alex.dev@hirepulse.com')
                setPassword('password123')
              }}
              className="px-2 py-0.5 rounded bg-primary/10 hover:bg-primary/20 transition-colors text-[11px] font-medium"
            >
              Auto-fill
            </button>
          </div>
          <div className="text-textmuted space-y-0.5 font-mono">
            <div><span className="text-textmain font-medium">Email:</span> alex.dev@hirepulse.com</div>
            <div><span className="text-textmain font-medium">Password:</span> password123</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-textmuted" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textmuted">
                <Mail size={18} />
              </span>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="input"
                style={{ paddingLeft: '2.5rem' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-textmuted" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textmuted">
                <Lock size={18} />
              </span>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="input"
                style={{ paddingLeft: '2.5rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full flex justify-center py-3 text-white font-semibold rounded-xl bg-primary hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="text-center space-y-3 pt-2">
          <p className="text-sm text-textmuted">
            Don't have an account?{' '}
            <a href="#/signup" className="text-primary hover:underline font-semibold">
              Sign up
            </a>
          </p>
          <div className="border-t border-border/60 my-4" />
          <a
            href="#/admin/login"
            className="inline-flex items-center gap-2 text-xs text-textmuted hover:text-primary transition-colors"
          >
            <Shield size={14} />
            <span>Switch to Admin Workspace</span>
          </a>
        </div>
      </div>
    </div>
  )
}
