import React, { createContext, useState, useEffect, useContext } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('hp_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        localStorage.removeItem('hp_user')
      }
    }
    setLoading(false)
  }, [])

const API_BASE_URL = 'http://localhost:5000/api'

// Action: User Login
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
      localStorage.setItem('hp_user', JSON.stringify(data.user))
      return data.user
    } else {
      const errData = await res.json()
      throw new Error(errData.error || 'Login failed')
    }
  } catch (err) {
    if (err.message && err.message !== 'Failed to fetch') {
      throw err; // Re-throw validation errors from backend
    }
    
    console.warn('Backend login failed or server offline. Using local frontend fallback:', err);
    // For prototyping: allow any login, check if there's a registered user in localStorage
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
    localStorage.setItem('hp_user', JSON.stringify(loggedUser))
    return loggedUser
  }
}

// Action: Admin Login
const loginAdmin = async (email, password) => {
  try {
    // Both user and admin logins route through the backend auth controller
    return await loginUser(email, password)
  } catch (err) {
    if (err.message && err.message !== 'Failed to fetch') {
      throw err;
    }
    console.warn('Backend admin login failed or server offline. Using local fallback:', err);
    const loggedAdmin = {
      name: 'System Admin',
      email,
      role: 'admin',
      isSetupCompleted: true,
    }
    setUser(loggedAdmin)
    localStorage.setItem('hp_user', JSON.stringify(loggedAdmin))
    return loggedAdmin
  }
}

// Action: User Signup (Step 1)
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
      localStorage.setItem('hp_user', JSON.stringify(data.user))
      return data.user
    } else {
      const errData = await res.json()
      throw new Error(errData.error || 'Signup failed')
    }
  } catch (err) {
    if (err.message && err.message !== 'Failed to fetch') {
      throw err;
    }
    console.warn('Backend signup failed or server offline. Using local fallback:', err);
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
    localStorage.setItem('hp_user', JSON.stringify(newUser))
    return newUser
  }
}

// Action: Complete Profile Setup (Step 2 & 3)
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
      localStorage.setItem('hp_user', JSON.stringify(data.user))
      return data.user
    } else {
      const errData = await res.json()
      throw new Error(errData.error || 'Profile setup failed')
    }
  } catch (err) {
    if (err.message && err.message !== 'Failed to fetch') {
      throw err;
    }
    console.warn('Backend profile setup failed or server offline. Using local fallback:', err);
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
    localStorage.setItem('hp_user', JSON.stringify(updatedUser))
    return updatedUser
  }
}

// Action: General Profile Update (skills, resume, bio, etc.)
const updateUserProfile = (updatedFields) => {
  if (!user) return
  const updatedUser = {
    ...user,
    ...updatedFields,
  }

  const savedUsers = JSON.parse(localStorage.getItem('hp_registered_users') || '[]')
  const userIdx = savedUsers.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase())
  if (userIdx > -1) {
    savedUsers[userIdx] = updatedUser
    localStorage.setItem('hp_registered_users', JSON.stringify(savedUsers))
  }

  setUser(updatedUser)
  localStorage.setItem('hp_user', JSON.stringify(updatedUser))
  return updatedUser
}

// Action: Logout
const logout = () => {
  setUser(null)
  localStorage.removeItem('hp_user')
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
