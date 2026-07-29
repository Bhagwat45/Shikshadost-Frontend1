import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { authService } from '../services/auth'
import type { LoginPayload, RegisterPayload, User } from '../types/auth'

interface AuthContextValue { user: User | null; isLoading: boolean; login: (data: LoginPayload) => Promise<User>; register: (data: RegisterPayload) => Promise<User>; logout: () => void }
const AuthContext = createContext<AuthContextValue | undefined>(undefined)
const TOKEN_KEY = 'shikshadost_token'
export function AuthProvider({ children }: { children: ReactNode }) { const [user, setUser] = useState<User | null>(null); const [isLoading, setIsLoading] = useState(true)
  useEffect(() => { if (!localStorage.getItem(TOKEN_KEY)) { setIsLoading(false); return } authService.me().then(setUser).catch(() => localStorage.removeItem(TOKEN_KEY)).finally(() => setIsLoading(false)) }, [])
  const persist = (response: { access_token: string; user: User }) => { localStorage.setItem(TOKEN_KEY, response.access_token); setUser(response.user); return response.user }
  return <AuthContext.Provider value={{ user, isLoading, login: async data => persist(await authService.login(data)), register: async data => persist(await authService.register(data)), logout: () => { localStorage.removeItem(TOKEN_KEY); setUser(null) } }}>{children}</AuthContext.Provider> }
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('useAuth must be used within AuthProvider'); return context }
