import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { AppRole } from '../types/database'

type RoleBasedRouteProps = {
  allowedRoles: AppRole[]
  children: ReactNode
  redirectTo?: string
}

export function RoleBasedRoute({
  allowedRoles,
  children,
  redirectTo = '/dashboard',
}: RoleBasedRouteProps) {
  const { isAdmin, roleName } = useAuth()

  if (isAdmin || (roleName && allowedRoles.includes(roleName))) {
    return children
  }

  return <Navigate to={redirectTo} replace />
}
