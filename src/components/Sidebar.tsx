import { X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { menuItems } from '../config/menu'
import { useAuth } from '../hooks/useAuth'
import { cn } from '../utils/cn'

type SidebarProps = {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { isAdmin, roleName } = useAuth()
  const visibleNavItems = menuItems.filter((item) => {
    if (isAdmin) {
      return true
    }

    return Boolean(roleName && item.visibleRoles.includes(roleName))
  })

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-neutral-200 bg-white transition-transform duration-200 lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-5">
        <NavLink
          to="/dashboard"
          className="flex items-center gap-3"
          onClick={onClose}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-sm font-semibold text-white">
            D
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-neutral-950">
              Döngü CRM
            </span>
            <span className="block truncate text-xs text-neutral-500">
              Admin Panel
            </span>
          </span>
        </NavLink>

        <button
          type="button"
          aria-label="Menüyü kapat"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 lg:hidden"
          onClick={onClose}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            end
            className={({ isActive }) =>
              cn(
                'flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950',
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-neutral-200 p-4">
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <p className="text-xs font-medium text-neutral-500">Ortam</p>
          <p className="mt-1 truncate text-sm font-semibold text-neutral-900">
            Geliştirme
          </p>
        </div>
      </div>
    </aside>
  )
}
