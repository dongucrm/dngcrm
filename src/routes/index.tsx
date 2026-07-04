import { Navigate, Route, Routes } from 'react-router-dom'
import { menuItems, moduleMenuItems } from '../config/menu'
import { AppLayout } from '../layouts/AppLayout'
import { DashboardPage } from '../pages/DashboardPage'
import { HealthPage } from '../pages/HealthPage'
import { LoginPage } from '../pages/LoginPage'
import { ModulePlaceholderPage } from '../pages/ModulePlaceholderPage'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleBasedRoute } from './RoleBasedRoute'

const dashboardMenuItem = menuItems.find((item) => item.id === 'dashboard')

function getRoutePath(path: string) {
  return path.replace(/^\//, '')
}

export function AppRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="/login" replace />} />

      <Route element={<AppLayout />}>
        {dashboardMenuItem ? (
          <Route
            path={getRoutePath(dashboardMenuItem.path)}
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={dashboardMenuItem.routeRoles}>
                  <DashboardPage />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
        ) : null}
        {moduleMenuItems.map((item) => (
          <Route
            key={item.id}
            path={getRoutePath(item.path)}
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={item.routeRoles}>
                  <ModulePlaceholderPage item={item} />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
        ))}
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
