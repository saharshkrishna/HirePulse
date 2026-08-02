import React, { createContext, useState, useEffect, useContext } from 'react'

const AuthContext = createContext()

const STORAGE_USER = 'hp_user_session'
const STORAGE_ADMIN = 'hp_admin_session'
const TOKEN_USER = 'hp_user_token'
const TOKEN_ADMIN = 'hp_admin_token'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

/**
 * Returns 'admin' if the current URL hash is an admin route, 'user' otherwise.
 */
function getScopeFromHash(hash = '') {
  return hash.startsWith('#/admin') ? 'admin' : 'user'
}

/**
 * Builds Authorization header from the stored JWT for the given scope.
 */
function getAuthHeaders(scope = 'user') {
  const tokenKey = scope === 'admin' ? TOKEN_ADMIN : TOKEN_USER
  const token = sessionStorage.getItem(tokenKey)
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
}

/**
 * Returns the stored JWT for the current scope. Used by api.js callers.
 */
export function getToken(scope = 'user') {
  return sessionStorage.getItem(scope === 'admin' ? TOKEN_ADMIN : TOKEN_USER)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Sync session state with active route scope on mount and hashchange
  useEffect(() => {
    const syncSession = () => {
      // Legacy migration: move hp_user (old single key) to new scoped keys
      const legacyStr = localStorage.getItem('hp_user')
      if (legacyStr) {
        try {
          const parsed = JSON.parse(legacyStr)
          const legacyKey = parsed.role === 'admin' ? STORAGE_ADMIN : STORAGE_USER
          localStorage.setItem(legacyKey, JSON.stringify(parsed))
        } catch (_) { /* ignore invalid JSON */ }
        localStorage.removeItem('hp_user')
      }

      const scope = getScopeFromHash(window.location.hash)
      const storageKey = scope === 'admin' ? STORAGE_ADMIN : STORAGE_USER
      const tokenKey = scope === 'admin' ? TOKEN_ADMIN : TOKEN_USER
      const stored = localStorage.getItem(storageKey)
      const token = sessionStorage.getItem(tokenKey)

      if (stored && token) {
        try {
          const parsed = JSON.parse(stored)
          if (parsed && (scope !== 'admin' || parsed.role === 'admin')) {
            setUser(parsed)
            setLoading(false)
            return
          }
        } catch (_) {
          localStorage.removeItem(storageKey)
        }
      }

      setUser(null)
      setLoading(false)
    }

    syncSession()
    window.addEventListener('hashchange', syncSession)
    return () => window.removeEventListener('hashchange', syncSession)
  }, [])

  // ── Action: Candidate User Login ────────────────────────────────────────
  const loginUser = async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Login failed')
    }

    const safeUser = {
      _id: data.user._id,
      name: data.user.name,
      email: data.user.email,
      phone: data.user.phone,
      role: data.user.role,
      profileType: data.user.profileType,
      isSetupCompleted: data.user.isSetupCompleted,
      profileDetails: data.user.profileDetails || {},
    }

    // Store JWT in sessionStorage (cleared on tab close) and minimal profile in localStorage
    sessionStorage.setItem(TOKEN_USER, data.token)
    localStorage.setItem(STORAGE_USER, JSON.stringify(safeUser))
    setUser(safeUser)
    return safeUser
  }

  // ── Action: System Admin Login ───────────────────────────────────────────
  const loginAdmin = async (email, password) => {
    // SECURITY: No offline fallback for admin — must reach backend to authenticate
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Admin login failed')
    }

    if (data.user.role !== 'admin') {
      throw new Error('This account does not have administrative privileges.')
    }

    const safeAdmin = {
      name: data.user.name,
      email: data.user.email,
      role: 'admin',
      isSetupCompleted: true,
    }

    sessionStorage.setItem(TOKEN_ADMIN, data.token)
    localStorage.setItem(STORAGE_ADMIN, JSON.stringify(safeAdmin))
    setUser(safeAdmin)
    return safeAdmin
  }

  // ── Action: User Signup ──────────────────────────────────────────────────
  const signupUser = async ({ name, email, phone, password }) => {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password })
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Signup failed')
    }

    const safeUser = {
      _id: data.user._id,
      name: data.user.name,
      email: data.user.email,
      phone: data.user.phone,
      role: data.user.role,
      profileType: data.user.profileType,
      isSetupCompleted: data.user.isSetupCompleted,
      profileDetails: data.user.profileDetails || {},
    }

    sessionStorage.setItem(TOKEN_USER, data.token)
    localStorage.setItem(STORAGE_USER, JSON.stringify(safeUser))
    setUser(safeUser)
    return safeUser
  }

  // ── Action: Complete Profile Setup ──────────────────────────────────────
  const completeProfileSetup = async (profileType, details) => {
    if (!user) return

    const res = await fetch(`${API_BASE_URL}/auth/setup-profile`, {
      method: 'POST',
      headers: getAuthHeaders('user'),
      body: JSON.stringify({ profileType, profileDetails: details })
      // NOTE: userId is now taken from the JWT on the server side
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Profile setup failed')
    }

    const updatedUser = {
      ...user,
      profileType: data.user.profileType,
      isSetupCompleted: data.user.isSetupCompleted,
      profileDetails: data.user.profileDetails,
    }

    localStorage.setItem(STORAGE_USER, JSON.stringify(updatedUser))
    setUser(updatedUser)
    return updatedUser
  }

  // ── Action: Profile Update (local only, non-sensitive fields) ────────────
  const updateUserProfile = (updatedFields) => {
    if (!user) return

    // Only allow updating safe display fields
    const allowedFields = ['skills', 'bio', 'location', 'linkedinUrl', 'githubUrl', 'portfolioUrl', 'appliedJobs', 'resume']
    const safeUpdate = Object.fromEntries(
      Object.entries(updatedFields).filter(([k]) => allowedFields.includes(k))
    )

    const updatedUser = { ...user, ...safeUpdate }
    const storageKey = user.role === 'admin' ? STORAGE_ADMIN : STORAGE_USER
    localStorage.setItem(storageKey, JSON.stringify(updatedUser))
    setUser(updatedUser)
    return updatedUser
  }

  // ── Action: Logout ───────────────────────────────────────────────────────
  const logout = () => {
    const scope = getScopeFromHash(window.location.hash) || (user?.role === 'admin' ? 'admin' : 'user')
    if (scope === 'admin' || user?.role === 'admin') {
      localStorage.removeItem(STORAGE_ADMIN)
      sessionStorage.removeItem(TOKEN_ADMIN)
    } else {
      localStorage.removeItem(STORAGE_USER)
      sessionStorage.removeItem(TOKEN_USER)
    }
    setUser(null)
  }

  /**
   * Expose getAuthHeaders so other components can attach Authorization headers.
   * scope: 'user' | 'admin'
   */
  const getHeaders = (scope) => getAuthHeaders(scope || (user?.role === 'admin' ? 'admin' : 'user'))

  return (
    <AuthContext.Provider value={{
      user, loading,
      loginUser, loginAdmin, signupUser,
      completeProfileSetup, updateUserProfile,
      logout, getHeaders
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
