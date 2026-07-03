import { Activity, Building2, CircleDollarSign, UsersRound } from 'lucide-react'
import { StatCard } from '../components/StatCard'
import { usePageTitle } from '../hooks/usePageTitle'

const stats = [
  {
    label: 'Müşteriler',
    value: '128',
    detail: 'Aktif kayıtlar',
    icon: UsersRound,
  },
  {
    label: 'Firmalar',
    value: '34',
    detail: 'Takip edilen hesaplar',
    icon: Building2,
  },
  {
    label: 'Fırsatlar',
    value: '18',
    detail: 'Açık satış süreci',
    icon: CircleDollarSign,
  },
  {
    label: 'Aktivite',
    value: '42',
    detail: 'Bu haftaki temaslar',
    icon: Activity,
  },
]

export function DashboardPage() {
  usePageTitle('Dashboard')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">Dashboard</p>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-950 sm:text-3xl">
            CRM özeti
          </h1>
        </div>
        <p className="text-sm text-neutral-500">Bugün</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <article className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-base font-semibold text-neutral-950">
              Satış akışı
            </h2>
            <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              Hazır
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {['Yeni lead', 'Teklif', 'Görüşme', 'Kazanıldı'].map(
              (stage, index) => (
                <div
                  key={stage}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-3"
                >
                  <span className="text-sm font-medium text-neutral-700">
                    {stage}
                  </span>
                  <span className="text-sm text-neutral-500">{index + 3}</span>
                </div>
              ),
            )}
          </div>
        </article>

        <article className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-950">
            Son aktiviteler
          </h2>
          <div className="mt-5 space-y-4">
            {['Yeni müşteri eklendi', 'Teklif güncellendi', 'Toplantı notu'].map(
              (activity) => (
                <div key={activity} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-800">
                      {activity}
                    </p>
                    <p className="text-xs text-neutral-500">Az önce</p>
                  </div>
                </div>
              ),
            )}
          </div>
        </article>
      </section>
    </div>
  )
}
