import { LayoutDashboard } from 'lucide-react'
import { usePageTitle } from '../hooks/usePageTitle'

export function DashboardPage() {
  usePageTitle('Dashboard')

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-emerald-700">Döngü CRM</p>
        <h1 className="mt-1 text-2xl font-semibold text-neutral-950 sm:text-3xl">
          Dashboard
        </h1>
      </div>

      <section className="rounded-lg border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          <LayoutDashboard className="h-6 w-6" aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-lg font-semibold text-neutral-950">
          Bu modül yakında eklenecek
        </h2>
      </section>
    </div>
  )
}
