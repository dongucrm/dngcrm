import type { LucideIcon } from 'lucide-react'

type StatCardProps = {
  label: string
  value: string
  detail: string
  icon: LucideIcon
}

export function StatCard({ label, value, detail, icon: Icon }: StatCardProps) {
  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-neutral-500">{label}</p>
          <p className="mt-2 truncate text-2xl font-semibold text-neutral-950">
            {value}
          </p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-sm text-neutral-500">{detail}</p>
    </article>
  )
}
