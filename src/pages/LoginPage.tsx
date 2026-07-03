import { ArrowRight, LockKeyhole } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'

export function LoginPage() {
  usePageTitle('Giriş')

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <LockKeyhole className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-2xl font-semibold text-neutral-950">
            Döngü CRM
          </h1>
          <p className="mt-2 text-sm text-neutral-500">Admin panel girişi</p>
        </div>

        <form className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-neutral-700">E-posta</span>
            <input
              type="email"
              className="mt-2 h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="admin@dongu.crm"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-neutral-700">Şifre</span>
            <input
              type="password"
              className="mt-2 h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="••••••••"
            />
          </label>

          <button
            type="button"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Giriş yap
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>

        <Link
          to="/"
          className="mt-6 inline-flex text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          Ana sayfaya dön
        </Link>
      </section>
    </main>
  )
}
