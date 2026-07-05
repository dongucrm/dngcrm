import { Navigate, Route, Routes } from 'react-router-dom'
import { menuItems, moduleMenuItems } from '../config/menu'
import { AppLayout } from '../layouts/AppLayout'
import { CallsPage } from '../pages/CallsPage'
import { DashboardPage } from '../pages/DashboardPage'
import { HealthPage } from '../pages/HealthPage'
import { LeadDetailPage } from '../pages/LeadDetailPage'
import { LeadsPage } from '../pages/LeadsPage'
import { LoginPage } from '../pages/LoginPage'
import { ModulePlaceholderPage } from '../pages/ModulePlaceholderPage'
import { ParentDetailPage } from '../pages/ParentDetailPage'
import { ParentsPage } from '../pages/ParentsPage'
import { ProgramDetailPage } from '../pages/ProgramDetailPage'
import { ProgramsPage } from '../pages/ProgramsPage'
import { RegistrationDetailPage } from '../pages/RegistrationDetailPage'
import { RegistrationsPage } from '../pages/RegistrationsPage'
import { StudentDetailPage } from '../pages/StudentDetailPage'
import { StudentsPage } from '../pages/StudentsPage'
import { TasksPage } from '../pages/TasksPage'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleBasedRoute } from './RoleBasedRoute'

const dashboardMenuItem = menuItems.find((item) => item.id === 'dashboard')
const leadsMenuItem = menuItems.find((item) => item.id === 'leads')
const parentsMenuItem = menuItems.find((item) => item.id === 'parents')
const studentsMenuItem = menuItems.find((item) => item.id === 'students')
const programsMenuItem = menuItems.find((item) => item.id === 'programs')
const registrationsMenuItem = menuItems.find(
  (item) => item.id === 'registrations',
)
const callsMenuItem = menuItems.find((item) => item.id === 'call-list')
const tasksMenuItem = menuItems.find((item) => item.id === 'tasks')
const placeholderMenuItems = moduleMenuItems.filter(
  (item) =>
    item.id !== 'leads' &&
    item.id !== 'parents' &&
    item.id !== 'students' &&
    item.id !== 'programs' &&
    item.id !== 'registrations' &&
    item.id !== 'call-list' &&
    item.id !== 'tasks',
)

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
        {callsMenuItem ? (
          <Route
            path={getRoutePath(callsMenuItem.path)}
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={callsMenuItem.routeRoles}>
                  <CallsPage />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
        ) : null}
        {parentsMenuItem ? (
          <>
            <Route
              path={getRoutePath(parentsMenuItem.path)}
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={parentsMenuItem.routeRoles}>
                    <ParentsPage />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path={`${getRoutePath(parentsMenuItem.path)}/:parentId`}
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={parentsMenuItem.routeRoles}>
                    <ParentDetailPage />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
          </>
        ) : null}
        {studentsMenuItem ? (
          <>
            <Route
              path={getRoutePath(studentsMenuItem.path)}
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={studentsMenuItem.routeRoles}>
                    <StudentsPage />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path={`${getRoutePath(studentsMenuItem.path)}/:studentId`}
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={studentsMenuItem.routeRoles}>
                    <StudentDetailPage />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
          </>
        ) : null}
        {programsMenuItem ? (
          <>
            <Route
              path={getRoutePath(programsMenuItem.path)}
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={programsMenuItem.routeRoles}>
                    <ProgramsPage />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path={`${getRoutePath(programsMenuItem.path)}/:programId`}
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={programsMenuItem.routeRoles}>
                    <ProgramDetailPage />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
          </>
        ) : null}
        {registrationsMenuItem ? (
          <>
            <Route
              path={getRoutePath(registrationsMenuItem.path)}
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={registrationsMenuItem.routeRoles}>
                    <RegistrationsPage />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path={`${getRoutePath(registrationsMenuItem.path)}/:registrationId`}
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={registrationsMenuItem.routeRoles}>
                    <RegistrationDetailPage />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
          </>
        ) : null}
        {tasksMenuItem ? (
          <Route
            path={getRoutePath(tasksMenuItem.path)}
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={tasksMenuItem.routeRoles}>
                  <TasksPage />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
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
