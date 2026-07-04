import { Construction } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { usePageTitle } from '../hooks/usePageTitle'
import type { MenuItem } from '../config/menu'

type ModulePlaceholderPageProps = {
  item: MenuItem
}

export function ModulePlaceholderPage({ item }: ModulePlaceholderPageProps) {
  usePageTitle(item.label)

  const { roleName } = useAuth()
  const canEdit = Boolean(roleName && item.editRoles?.includes(roleName))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">Döngü CRM</p>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-950 sm:text-3xl">
            {item.label}
          </h1>
        </div>

        {!canEdit ? (
          <span className="w-fit rounded-lg bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
            Salt okunur erişim
          </span>
        ) : null}
      </div>

      <section className="rounded-lg border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          <Construction className="h-6 w-6" aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-lg font-semibold text-neutral-950">
          Bu modül yakında eklenecek
        </h2>
      </section>
    </div>
  )
}
