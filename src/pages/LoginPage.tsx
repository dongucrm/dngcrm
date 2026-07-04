import { ArrowRight, LockKeyhole } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { usePageTitle } from '../hooks/usePageTitle'

type LoginLocationState = {
  from?: {
    pathname?: string
  }
}

export function LoginPage() {
  usePageTitle('Giriş')

  const navigate = useNavigate()
  const location = useLocation()
  const {
    error: authError,
    loading,
    login,
    profile,
    user,
  } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const locationState = location.state as LoginLocationState | null
  const requestedPath = locationState?.from?.pathname
  const redirectPath =
    requestedPath && requestedPath !== '/login' ? requestedPath : '/dashboard'
  const visibleError = formError ?? authError
  const isFormDisabled = loading || isSubmitting

  useEffect(() => {
    if (!loading && user && profile) {
      navigate(redirectPath, { replace: true })
    }
  }, [loading, navigate, profile, redirectPath, user])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const trimmedEmail = email.trim()

    if (!trimmedEmail || !password) {
      setFormError('Lütfen e-posta ve şifre alanlarını doldurun.')
      return
    }

    setIsSubmitting(true)

    const result = await login(trimmedEmail, password)

    setIsSubmitting(false)

    if (!result.success) {
      setFormError(result.error ?? 'Giriş yapılamadı. Lütfen tekrar deneyin.')
      return
    }

    navigate(redirectPath, { replace: true })
  }

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

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-neutral-700">E-posta</span>
            <input
              type="email"
              autoComplete="email"
              className="mt-2 h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="admin@dongu.crm"
              value={email}
              disabled={isFormDisabled}
              onChange={(event) => {
                setEmail(event.target.value)
                setFormError(null)
              }}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-neutral-700">Şifre</span>
            <input
              type="password"
              autoComplete="current-password"
              className="mt-2 h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="••••••••"
              value={password}
              disabled={isFormDisabled}
              onChange={(event) => {
                setPassword(event.target.value)
                setFormError(null)
              }}
            />
          </label>

          {visibleError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {visibleError}
            </p>
          ) : null}

          <button
            type="submit"
            aria-busy={isSubmitting}
            disabled={isFormDisabled}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      </section>
    </main>
  )
}
