import React, { createContext, useState, useEffect, useContext } from 'react'

const AuthContext = createContext()

const STORAGE_USER = 'hp_user_session'
const STORAGE_ADMIN = 'hp_admin_session'
const API_BASE_URL = 'http://localhost:5000/api'

/**
 * Helper to check if current URL hash belongs to Admin portal or User portal.
 */
function getScopeFromHash(hash = '') {
  return hash.startsWith('#/admin') ? 'admin' : 'user'
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Sync state with active role scope on mount and on hash changes
  useEffect(() => {
    const syncSession = () => {
      // Legacy migration from old single key if present
      const legacyUserStr = localStorage.getItem('hp_user')
      if (legacyUserStr) {
        try {
          const parsed = JSON.parse(legacyUserStr)
          if (parsed.role === 'admin') {
            localStorage.setItem(STORAGE_ADMIN, JSON.stringify(parsed))
          } else {
            localStorage.setItem(STORAGE_USER, JSON.stringify(parsed))
          }
        } catch (e) {
          // ignore invalid legacy JSON
        }
        localStorage.removeItem('hp_user')
      }

      const scope = getScopeFromHash(window.location.hash)
      if (scope === 'admin') {
        const storedAdmin = localStorage.getItem(STORAGE_ADMIN)
        if (storedAdmin) {
          try {
            const parsedAdmin = JSON.parse(storedAdmin)
            if (parsedAdmin && parsedAdmin.role === 'admin') {
              setUser(parsedAdmin)
              setLoading(false)
              return
            }
          } catch (e) {
            localStorage.removeItem(STORAGE_ADMIN)
          }
        }
        setUser(null)
      } else {
        const storedUser = localStorage.getItem(STORAGE_USER)
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser)
            if (parsedUser) {
              setUser(parsedUser)
              setLoading(false)
              return
            }
          } catch (e) {
            localStorage.removeItem(STORAGE_USER)
          }
        }
        setUser(null)
      }
      setLoading(false)
    }

    syncSession()
    window.addEventListener('hashchange', syncSession)
    return () => window.removeEventListener('hashchange', syncSession)
  }, [])

  // Action: Candidate User Login
  const loginUser = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        localStorage.setItem(STORAGE_USER, JSON.stringify(data.user))
        return data.user
      } else {
        const errData = await res.json()
        throw new Error(errData.error || 'Login failed')
      }
    } catch (err) {
      if (err.message && err.message !== 'Failed to fetch') {
        throw err
      }
      
      console.warn('Backend login failed or server offline. Using local frontend fallback:', err)
      const savedUsers = JSON.parse(localStorage.getItem('hp_registered_users') || '[]')
      const existing = savedUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())

      let loggedUser
      if (existing) {
        loggedUser = { ...existing }
      } else {
        loggedUser = {
          name: email.split('@')[0],
          email,
          phone: '1234567890',
          role: 'user',
          profileType: null,
          profileDetails: null,
          isSetupCompleted: false,
        }
        
        savedUsers.push(loggedUser)
        localStorage.setItem('hp_registered_users', JSON.stringify(savedUsers))
      }

      setUser(loggedUser)
      localStorage.setItem(STORAGE_USER, JSON.stringify(loggedUser))
      return loggedUser
    }
  }

  // Action: System Admin Login
  const loginAdmin = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.user.role !== 'admin') {
          throw new Error('This account does not have administrative privileges.')
        }
        setUser(data.user)
        localStorage.setItem(STORAGE_ADMIN, JSON.stringify(data.user))
        return data.user
      } else {
        const errData = await res.json()
        throw new Error(errData.error || 'Admin login failed')
      }
    } catch (err) {
      if (err.message && err.message !== 'Failed to fetch') {
        throw err
      }

      console.warn('Backend admin login failed or server offline. Using local fallback:', err)
      const loggedAdmin = {
        name: 'System Admin',
        email,
        role: 'admin',
        isSetupCompleted: true,
      }
      setUser(loggedAdmin)
      localStorage.setItem(STORAGE_ADMIN, JSON.stringify(loggedAdmin))
      return loggedAdmin
    }
  }

  // Action: User Signup
  const signupUser = async ({ name, email, phone, password }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password })
      })

      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        localStorage.setItem(STORAGE_USER, JSON.stringify(data.user))
        return data.user
      } else {
        const errData = await res.json()
        throw new Error(errData.error || 'Signup failed')
      }
    } catch (err) {
      if (err.message && err.message !== 'Failed to fetch') {
        throw err
      }

      console.warn('Backend signup failed or server offline. Using local fallback:', err)
      const newUser = {
        name,
        email,
        phone,
        role: 'user',
        profileType: null,
        profileDetails: null,
        isSetupCompleted: false,
      }

      const savedUsers = JSON.parse(localStorage.getItem('hp_registered_users') || '[]')
      const existingIndex = savedUsers.findIndex((u) => u.email.toLowerCase() === email.toLowerCase())
      if (existingIndex > -1) {
        savedUsers[existingIndex] = newUser
      } else {
        savedUsers.push(newUser)
      }
      localStorage.setItem('hp_registered_users', JSON.stringify(savedUsers))

      setUser(newUser)
      localStorage.setItem(STORAGE_USER, JSON.stringify(newUser))
      return newUser
    }
  }

  // Action: Complete Profile Setup
  const completeProfileSetup = async (profileType, details) => {
    if (!user) return

    try {
      const res = await fetch(`${API_BASE_URL}/auth/setup-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id || user.id,
          profileType,
          profileDetails: details
        })
      })

      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        localStorage.setItem(STORAGE_USER, JSON.stringify(data.user))
        return data.user
      } else {
        const errData = await res.json()
        throw new Error(errData.error || 'Profile setup failed')
      }
    } catch (err) {
      if (err.message && err.message !== 'Failed to fetch') {
        throw err
      }

      console.warn('Backend profile setup failed or server offline. Using local fallback:', err)
      const updatedUser = {
        ...user,
        profileType,
        profileDetails: details,
        isSetupCompleted: true,
      }

      const savedUsers = JSON.parse(localStorage.getItem('hp_registered_users') || '[]')
      const userIdx = savedUsers.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase())
      if (userIdx > -1) {
        savedUsers[userIdx] = updatedUser
        localStorage.setItem('hp_registered_users', JSON.stringify(savedUsers))
      }

      setUser(updatedUser)
      localStorage.setItem(STORAGE_USER, JSON.stringify(updatedUser))
      return updatedUser
    }
  }

  // Action: Profile Update
  const updateUserProfile = (updatedFields) => {
    if (!user) return
    const updatedUser = {
      ...user,
      ...updatedFields,
    }

    const storageKey = user.role === 'admin' ? STORAGE_ADMIN : STORAGE_USER
    setUser(updatedUser)
    localStorage.setItem(storageKey, JSON.stringify(updatedUser))
    return updatedUser
  }

  // Action: Logout
  const logout = () => {
    const scope = getScopeFromHash(window.location.hash) || (user?.role === 'admin' ? 'admin' : 'user')
    if (scope === 'admin' || user?.role === 'admin') {
      localStorage.removeItem(STORAGE_ADMIN)
    } else {
      localStorage.removeItem(STORAGE_USER)
    }
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, loginAdmin, signupUser, completeProfileSetup, updateUserProfile, logout }}>
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
