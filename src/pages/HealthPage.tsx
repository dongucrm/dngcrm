import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import { supabase } from '../lib/supabase'

type ConnectionStatus = 'checking' | 'connected' | 'error'

export function HealthPage() {
  usePageTitle('Health')

  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('checking')
  const [connectionMessage, setConnectionMessage] = useState(
    'Supabase bağlantısı kontrol ediliyor.',
  )

  useEffect(() => {
    let isMounted = true

    async function checkConnection() {
      setConnectionStatus('checking')
      setConnectionMessage('Supabase bağlantısı kontrol ediliyor.')

      const { error } = await supabase
        .from('roles')
        .select('id', { count: 'exact', head: true })

      if (!isMounted) {
        return
      }

      if (error) {
        setConnectionStatus('error')
        setConnectionMessage(
          'Supabase bağlantısı doğrulanamadı. Lütfen oturum ve RLS ayarlarını kontrol edin.',
        )
        return
      }

      setConnectionStatus('connected')
      setConnectionMessage('Supabase bağlantısı aktif.')
    }

    void checkConnection()

    return () => {
      isMounted = false
    }
  }, [])

  const StatusIcon =
    connectionStatus === 'connected'
      ? CheckCircle2
      : connectionStatus === 'checking'
        ? Loader2
        : AlertCircle

  const statusLabel =
    connectionStatus === 'connected'
      ? 'Bağlı'
      : connectionStatus === 'checking'
        ? 'Kontrol ediliyor'
        : 'Bağlantı hatası'

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
            Supabase bağlantısı
          </h2>
        </div>
        <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <StatusIcon
              className={
                connectionStatus === 'connected'
                  ? 'mt-0.5 h-5 w-5 shrink-0 text-emerald-600'
                  : connectionStatus === 'checking'
                    ? 'mt-0.5 h-5 w-5 shrink-0 animate-spin text-neutral-500'
                    : 'mt-0.5 h-5 w-5 shrink-0 text-red-600'
              }
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-900">
                {statusLabel}
              </p>
              <p className="mt-1 text-sm text-neutral-600">
                {connectionMessage}
              </p>
            </div>
          </div>
          <span
            className={
              connectionStatus === 'connected'
                ? 'w-fit rounded-lg bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700'
                : connectionStatus === 'checking'
                  ? 'w-fit rounded-lg bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700'
                  : 'w-fit rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-700'
            }
          >
            Key bilgisi gösterilmez
          </span>
        </div>
      </section>
    </div>
  )
}
