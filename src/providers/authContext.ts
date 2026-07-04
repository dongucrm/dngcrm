import type { Session, User } from '@supabase/supabase-js'
import { createContext } from 'react'
import type { AppRole, Profile, Role } from '../types/database'

export type AuthResult = {
  success: boolean
  error?: string
}

export type AuthContextValue = {
  session: Session | null
  user: User | null
  profile: Profile | null
  role: Role | null
  roleName: AppRole | null
  loading: boolean
  error: string | null
  isAdmin: boolean
  isSales: boolean
  login: (email: string, password: string) => Promise<AuthResult>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)
