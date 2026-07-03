import { CheckCircle2, CircleDashed } from 'lucide-react'
import { isSupabaseConfigured } from '../lib/supabase'
import { usePageTitle } from '../hooks/usePageTitle'

const checks = [
  { label: 'React', ready: true },
  { label: 'Vite', ready: true },
  { label: 'TypeScript', ready: true },
  { label: 'Tailwind CSS', ready: true },
  { label: 'React Router', ready: true },
  { label: 'Supabase JS', ready: isSupabaseConfigured },
]

export function HealthPage() {
  usePageTitle('Health')

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-emerald-700">Health</p>
        <h1 className="mt-1 text-2xl font-semibold text-neutral-950 sm:text-3xl">
          Sistem durumu
        </h1>
      </div>

      <section className="rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 px-5 py-4">
          <h2 className="text-base font-semibold text-neutral-950">
            Kurulum kontrolleri
          </h2>
        </div>
        <div className="divide-y divide-neutral-200">
          {checks.map((check) => {
            const Icon = check.ready ? CheckCircle2 : CircleDashed

            return (
              <div
                key={check.label}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Icon
                    className={
                      check.ready
                        ? 'h-5 w-5 shrink-0 text-emerald-600'
                        : 'h-5 w-5 shrink-0 text-amber-500'
                    }
                    aria-hidden="true"
                  />
                  <span className="truncate text-sm font-medium text-neutral-800">
                    {check.label}
                  </span>
                </div>
                <span
                  className={
                    check.ready
                      ? 'rounded-lg bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700'
                      : 'rounded-lg bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700'
                  }
                >
                  {check.ready ? 'Hazır' : 'Bekliyor'}
                </span>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
