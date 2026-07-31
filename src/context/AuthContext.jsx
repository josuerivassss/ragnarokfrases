import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { login as apiLogin, logout as apiLogout, verifySession } from '../lib/adminApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    verifySession().then(s => {
      setSession(s)
      setLoading(false)
    })
  }, [])

  const doLogin = useCallback(async (username, password) => {
    const s = await apiLogin(username, password)
    setSession(s)
    return s
  }, [])

  const doLogout = useCallback(async () => {
    await apiLogout()
    setSession(null)
  }, [])

  return (
    <AuthContext.Provider value={{ session, loading, login: doLogin, logout: doLogout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
