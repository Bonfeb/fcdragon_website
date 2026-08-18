import { createContext, useContext, useState, useCallback } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)
const STORAGE_KEY = 'dragonfc_token'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY))
  const [username, setUsername] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (user, pass) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.login(user, pass)
      localStorage.setItem(STORAGE_KEY, data.access_token)
      setToken(data.access_token)
      setUsername(user)
      return true
    } catch (e) {
      setError(e.message || 'Login failed')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setToken(null)
    setUsername(null)
  }, [])

  const value = {
    token,
    username,
    isAuthenticated: !!token,
    login,
    logout,
    error,
    loading,
    clearError: () => setError(null),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
