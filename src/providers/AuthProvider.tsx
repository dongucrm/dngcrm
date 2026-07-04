import type { Session, User } from '@supabase/supabase-js'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '../lib/supabase'
import type { AppRole, Profile, Role } from '../types/database'
import { AuthContext, type AuthContextValue } from './authContext'

type ProfileWithRole = Profile & {
  roles: Role | Role[] | null
}

const authErrorMessages = {
  inactiveAccount:
    'Hesabınız pasif durumda. Lütfen yönetici ile iletişime geçin.',
  invalidCredentials: 'E-posta veya şifre hatalı.',
  missingProfile: 'Kullanıcı profili bulunamadı.',
  missingRole: 'Kullanıcı rolü bulunamadı.',
  profileLoadFailed: 'Profil bilgisi alınamadı. Lütfen tekrar deneyin.',
  unsupportedRole: 'Kullanıcı rolü sistem erişimi için yetkili değil.',
  sessionLoadFailed: 'Oturum bilgisi alınamadı. Lütfen tekrar deneyin.',
  signInFailed: 'Giriş işlemi sırasında bir hata oluştu.',
  signOutFailed: 'Çıkış yapılırken bir hata oluştu.',
} as const

const appErrorMessages = new Set<string>(Object.values(authErrorMessages))

function getRoleName(role: Role | null): AppRole | null {
  if (role?.name === 'admin' || role?.name === 'satis_personeli') {
    return role.name
  }

  return null
}

function normalizeRole(roles: ProfileWithRole['roles']) {
  if (Array.isArray(roles)) {
    return roles[0] ?? null
  }

  return roles
}

function getErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.'
  }

  if (appErrorMessages.has(error.message)) {
    return error.message
  }

  const message = error.message.toLowerCase()

  if (message.includes('invalid login credentials')) {
    return authErrorMessages.invalidCredentials
  }

  if (message.includes('email not confirmed')) {
    return 'E-posta adresiniz henüz doğrulanmamış.'
  }

  if (message.includes('too many requests')) {
    return 'Çok fazla deneme yapıldı. Lütfen kısa bir süre sonra tekrar deneyin.'
  }

  return authErrorMessages.signInFailed
}

async function fetchAuthProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      `
        id,
        full_name,
        phone,
        role_id,
        is_active,
        created_at,
        roles (
          id,
          name,
          description,
          created_at
        )
      `,
    )
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw new Error(authErrorMessages.profileLoadFailed)
  }

  if (!data) {
    await supabase.auth.signOut()
    throw new Error(authErrorMessages.missingProfile)
  }

  const { roles, ...profile } = data as ProfileWithRole
  const role = normalizeRole(roles)

  if (profile.is_active === false) {
    await supabase.auth.signOut()
    throw new Error(authErrorMessages.inactiveAccount)
  }

  if (!role) {
    await supabase.auth.signOut()
    throw new Error(authErrorMessages.missingRole)
  }

  if (!getRoleName(role)) {
    await supabase.auth.signOut()
    throw new Error(authErrorMessages.unsupportedRole)
  }

  return {
    profile,
    role,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isManualLoginRef = useRef(false)

  const clearAuthState = useCallback(() => {
    setSession(null)
    setUser(null)
    setProfile(null)
    setRole(null)
  }, [])

  const applySession = useCallback(
    async (nextSession: Session | null) => {
      setLoading(true)
      setError(null)

      if (!nextSession?.user) {
        clearAuthState()
        setLoading(false)
        return
      }

      try {
        const authProfile = await fetchAuthProfile(nextSession.user.id)

        setSession(nextSession)
        setUser(nextSession.user)
        setProfile(authProfile.profile)
        setRole(authProfile.role)
      } catch (sessionError) {
        clearAuthState()
        setError(getErrorMessage(sessionError))
      } finally {
        setLoading(false)
      }
    },
    [clearAuthState],
  )

  useEffect(() => {
    let isActive = true

    async function loadSession() {
      const { data, error: sessionError } = await supabase.auth.getSession()

      if (!isActive) {
        return
      }

      if (sessionError) {
        clearAuthState()
        setError(authErrorMessages.sessionLoadFailed)
        setLoading(false)
        return
      }

      await applySession(data.session)
    }

    void loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!isActive) {
        return
      }

      if (event === 'INITIAL_SESSION') {
        return
      }

      if (event === 'SIGNED_IN' && isManualLoginRef.current) {
        return
      }

      window.setTimeout(() => {
        if (isActive) {
          void applySession(nextSession)
        }
      }, 0)
    })

    return () => {
      isActive = false
      subscription.unsubscribe()
    }
  }, [applySession, clearAuthState])

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true)
      setError(null)
      isManualLoginRef.current = true

      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        })

      if (signInError) {
        const message = getErrorMessage(signInError)

        isManualLoginRef.current = false
        clearAuthState()
        setError(message)
        setLoading(false)

        return {
          success: false,
          error: message,
        }
      }

      if (!data.session || !data.user) {
        const message = authErrorMessages.sessionLoadFailed

        isManualLoginRef.current = false
        clearAuthState()
        setError(message)
        setLoading(false)

        return {
          success: false,
          error: message,
        }
      }

      try {
        const authProfile = await fetchAuthProfile(data.user.id)

        setSession(data.session)
        setUser(data.user)
        setProfile(authProfile.profile)
        setRole(authProfile.role)
        isManualLoginRef.current = false
        setLoading(false)

        return {
          success: true,
        }
      } catch (profileError) {
        const message = getErrorMessage(profileError)

        isManualLoginRef.current = false
        clearAuthState()
        setError(message)
        setLoading(false)

        return {
          success: false,
          error: message,
        }
      }
    },
    [clearAuthState],
  )

  const logout = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { error: signOutError } = await supabase.auth.signOut()

    clearAuthState()

    if (signOutError) {
      setError(authErrorMessages.signOutFailed)
    }

    setLoading(false)
  }, [clearAuthState])

  const refreshProfile = useCallback(async () => {
    if (!user) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const authProfile = await fetchAuthProfile(user.id)

      setProfile(authProfile.profile)
      setRole(authProfile.role)
    } catch (profileError) {
      clearAuthState()
      setError(getErrorMessage(profileError))
    } finally {
      setLoading(false)
    }
  }, [clearAuthState, user])

  const roleName = getRoleName(role)
  const isAdmin = roleName === 'admin'
  const isSales = roleName === 'satis_personeli'

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      role,
      roleName,
      loading,
      error,
      isAdmin,
      isSales,
      login,
      logout,
      refreshProfile,
    }),
    [
      error,
      isAdmin,
      isSales,
      loading,
      login,
      logout,
      profile,
      refreshProfile,
      role,
      roleName,
      session,
      user,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
