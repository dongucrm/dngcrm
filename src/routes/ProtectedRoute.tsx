import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

type ProtectedRouteProps = {
  children: ReactNode
  redirectTo?: string
}

function RouteLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-600 shadow-sm">
        Oturum kontrol ediliyor...
      </div>
    </div>
  )
}

export function ProtectedRoute({
  children,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { loading, profile, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return <RouteLoading />
  }

  if (!user || !profile) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  return children
}
