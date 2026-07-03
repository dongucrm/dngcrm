import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-950">
      {isSidebarOpen ? (
        <button
          type="button"
          aria-label="Menüyü kapat"
          className="fixed inset-0 z-30 bg-neutral-950/30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      ) : null}

      <div className="flex min-h-screen">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
