import { useEffect, useState } from 'react'
import { formatNullableDateTime } from '../../../utils/date'
import { callStatusLabels } from '../../../utils/labels'
import {
  fetchCallLogsForLead,
  getCallLogUser,
} from '../services/callLogService'
import type { CallLogRecord } from '../types'

type CallHistorySectionProps = {
  leadId: string
}

export function CallHistorySection({ leadId }: CallHistorySectionProps) {
  const [logs, setLogs] = useState<CallLogRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadLogs() {
      setLoading(true)
      setError(null)

      const result = await fetchCallLogsForLead(leadId)

      if (!isMounted) {
        return
      }

      if (result.error) {
        setLogs([])
        setError(result.error)
        setLoading(false)
        return
      }

      setLogs(result.data ?? [])
      setLoading(false)
    }

    void loadLogs()

    return () => {
      isMounted = false
    }
  }, [leadId])

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-neutral-950">
          Görüşme Geçmişi
        </h2>
        <span className="rounded-lg bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
          {logs.length} kayıt
        </span>
      </div>

      {loading ? (
        <p className="mt-4 text-sm font-medium text-neutral-600">
          Görüşme geçmişi yükleniyor...
        </p>
      ) : error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : logs.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">
          Bu lead için görüşme kaydı bulunmuyor.
        </p>
      ) : (
        <div className="mt-4 divide-y divide-neutral-200">
          {logs.map((log) => {
            const user = getCallLogUser(log)

            return (
              <article key={log.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-950">
                      {log.call_status
                        ? callStatusLabels[log.call_status]
                        : 'Durum yok'}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {formatNullableDateTime(log.call_date)}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-neutral-700">
                    {user?.full_name ?? 'Personel yok'}
                  </p>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-700">
                  {log.notes || '-'}
                </p>
                <p className="mt-3 text-xs font-medium text-neutral-500">
                  Sonraki arama:{' '}
                  <span className="text-neutral-800">
                    {formatNullableDateTime(log.next_call_date)}
                  </span>
                </p>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
