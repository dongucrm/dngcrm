import { CheckCircle2, Database, Route, ShieldCheck } from 'lucide-react'
import { usePageTitle } from '../hooks/usePageTitle'

const setupCards = [
  {
    title: 'Uygulama',
    value: 'React + Vite',
    icon: CheckCircle2,
  },
  {
    title: 'Rotalar',
    value: 'React Router',
    icon: Route,
  },
  {
    title: 'Veri katmanı',
    value: 'Supabase JS',
    icon: Database,
  },
]

export function HomePage() {
  usePageTitle('Ana Sayfa')

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex max-w-3xl flex-col gap-5">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium text-emerald-700">dongu-crm</p>
            <h1 className="mt-2 text-3xl font-semibold text-neutral-950 sm:text-4xl">
              Döngü CRM Kurulum Başarılı
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-neutral-600">
              Temel admin panel yapısı hazır ve geliştirmeye açık.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {setupCards.map((card) => (
          <article
            key={card.title}
            className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
                <card.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-neutral-500">
                  {card.title}
                </p>
                <p className="mt-1 truncate text-base font-semibold text-neutral-950">
                  {card.value}
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
