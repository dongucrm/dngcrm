import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { DashboardPage } from '../pages/DashboardPage'
import { HealthPage } from '../pages/HealthPage'
import { LoginPage } from '../pages/LoginPage'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleBasedRoute } from './RoleBasedRoute'

export function AppRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="/login" replace />} />

      <Route element={<AppLayout />}>
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['admin', 'satis_personeli']}>
                <DashboardPage />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="health"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['admin']}>
                <HealthPage />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
