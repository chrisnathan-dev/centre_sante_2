import { useEffect, useState, type ReactNode } from 'react'
import { getCurrentUser, loginUser, logoutUser, registerUser } from '../services/auth-api'
import type { AuthUser } from '../types/auth'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true

    getCurrentUser()
      .then((authenticatedUser) => {
        if (active) setUser(authenticatedUser)
      })
      .catch(() => {
        if (active) setUser(null)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  async function login(email: string, password: string) {
    const authenticatedUser = await loginUser(email, password)
    setUser(authenticatedUser)
    return authenticatedUser
  }

  async function register(name: string, email: string, password: string) {
    const authenticatedUser = await registerUser(name, email, password)
    setUser(authenticatedUser)
    return authenticatedUser
  }

  function logout() {
    void logoutUser().catch(() => undefined)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
