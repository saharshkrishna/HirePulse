import React, { useState } from 'react'
import { Mail, Lock, User, Phone, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function UserSignupPage() {
  const { signupUser } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name || !email || !phone || !password) {
      setError('Please fill in all fields.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    // Basic phone pattern check
    if (!/^\+?[\d\s-]{10,15}$/.test(phone)) {
      setError('Please enter a valid phone number (10-15 digits).')
      return
    }

    setLoading(true)
    try {
      // Mock network delay
      await new Promise((resolve) => setTimeout(resolve, 800))
      signupUser({ name, email, phone, password })
      window.location.hash = '#/setup-profile'
    } catch (err) {
      setError('Signup failed. Email might already be registered.')
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
          <h2 className="font-display text-2xl font-bold tracking-tight">Create an Account</h2>
          <p className="text-sm text-textmuted mt-2">
            Step 1: Setup your credentials to begin
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-warning bg-warning/10 p-3 rounded-lg border border-warning/20 text-sm">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-textmuted" htmlFor="name">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textmuted">
                <User size={18} />
              </span>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                className="input"
                style={{ paddingLeft: '2.5rem' }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

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
            <label className="text-sm font-semibold text-textmuted" htmlFor="phone">
              Phone Number
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textmuted">
                <Phone size={18} />
              </span>
              <input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                className="input"
                style={{ paddingLeft: '2.5rem' }}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-textmuted" htmlFor="password">
              Create Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textmuted">
                <Lock size={18} />
              </span>
              <input
                id="password"
                type="password"
                placeholder="Min. 6 characters"
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
            className="btn btn-primary w-full flex justify-center py-3 text-white font-semibold rounded-xl bg-primary hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Continue to Profile Setup'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm text-textmuted">
            Already have an account?{' '}
            <a href="#/login" className="text-primary hover:underline font-semibold">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
