import React, { useState } from 'react'
import { Mail, Lock, ArrowRight, ShieldAlert, Key, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function AdminLoginPage() {
  const { loginAdmin } = useAuth()
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
      // Mock network verification
      await new Promise((resolve) => setTimeout(resolve, 800))
      loginAdmin(email, password)
      window.location.hash = '#/dashboard'
    } catch (err) {
      setError('Authorization failed. Check your admin credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-basebg px-4 py-12 relative overflow-hidden">
      {/* Background ambient glows - security themed orange/red or cyan */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-warning/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="panel max-w-md w-full p-8 space-y-8 backdrop-blur-md relative z-10 border-t-4 border-t-warning">
        <div className="text-center">
          {/* Admin Security Badge */}
          <div className="w-12 h-12 rounded-xl bg-warning/10 text-warning flex items-center justify-center mx-auto mb-4 border border-warning/20">
            <ShieldAlert size={24} />
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Admin Console</h2>
          <p className="text-sm text-textmuted mt-2">
            Sign in to access source health, job indexers, and crawl systems.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-warning bg-warning/10 p-3 rounded-lg border border-warning/20 text-sm">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-textmuted" htmlFor="admin-email">
              Administrative Email
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textmuted">
                <Mail size={18} />
              </span>
              <input
                id="admin-email"
                type="email"
                placeholder="admin@hirepulse.com"
                className="input"
                style={{ paddingLeft: '2.5rem' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-textmuted" htmlFor="admin-password">
              Admin Key / Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textmuted">
                <Lock size={18} />
              </span>
              <input
                id="admin-password"
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
            {loading ? 'Authenticating Admin...' : 'Access Admin Panel'}
            {!loading && <Key size={16} />}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-border/60">
          <a
            href="#/login"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-semibold"
          >
            <ArrowRight size={14} className="rotate-180" />
            <span>Back to User Workspace</span>
          </a>
        </div>
      </div>
    </div>
  )
}
