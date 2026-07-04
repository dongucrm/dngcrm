import { Navigate, Route, Routes } from 'react-router-dom'
import { menuItems, moduleMenuItems } from '../config/menu'
import { AppLayout } from '../layouts/AppLayout'
import { DashboardPage } from '../pages/DashboardPage'
import { HealthPage } from '../pages/HealthPage'
import { LeadDetailPage } from '../pages/LeadDetailPage'
import { LeadsPage } from '../pages/LeadsPage'
import { LoginPage } from '../pages/LoginPage'
import { ModulePlaceholderPage } from '../pages/ModulePlaceholderPage'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleBasedRoute } from './RoleBasedRoute'

const dashboardMenuItem = menuItems.find((item) => item.id === 'dashboard')
const leadsMenuItem = menuItems.find((item) => item.id === 'leads')
const placeholderMenuItems = moduleMenuItems.filter((item) => item.id !== 'leads')

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
        {leadsMenuItem ? (
          <>
            <Route
              path={getRoutePath(leadsMenuItem.path)}
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={leadsMenuItem.routeRoles}>
                    <LeadsPage />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path={`${getRoutePath(leadsMenuItem.path)}/:leadId`}
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={leadsMenuItem.routeRoles}>
                    <LeadDetailPage />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
          </>
        ) : null}
        {placeholderMenuItems.map((item) => (
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
