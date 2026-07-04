import { ListChecks } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { formatNullableDateTime } from '../../../utils/date'
import { callStatusLabels } from '../../../utils/labels'
import { TaskForm } from '../../tasks/components/TaskForm'
import {
  createTaskValuesFromLead,
  fetchTaskReferences,
  saveTask,
} from '../../tasks/services/taskService'
import type {
  TaskFormValues,
  TaskReferences,
} from '../../tasks/types'
import {
  fetchCallLogsForLead,
  getCallLogUser,
} from '../services/callLogService'
import type { CallLogRecord } from '../types'

type CallHistorySectionProps = {
  leadId: string
}

const emptyTaskReferences: TaskReferences = {
  leads: [],
  parents: [],
  profiles: [],
}

export function CallHistorySection({ leadId }: CallHistorySectionProps) {
  const { isAdmin, isSales, user } = useAuth()
  const auth = useMemo(
    () => ({
      isAdmin,
      isSales,
      userId: user?.id ?? null,
    }),
    [isAdmin, isSales, user?.id],
  )
  const [logs, setLogs] = useState<CallLogRecord[]>([])
  const [taskReferences, setTaskReferences] =
    useState<TaskReferences>(emptyTaskReferences)
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadLogs = useCallback(async () => {
    setLoading(true)
    setError(null)

    const result = await fetchCallLogsForLead(leadId)

    if (result.error) {
      setLogs([])
      setError(result.error)
      setLoading(false)
      return
    }

    setLogs(result.data ?? [])
    setLoading(false)
  }, [leadId])

  useEffect(() => {
    async function loadTaskReferences() {
      const result = await fetchTaskReferences(auth)

      if (result.data) {
        setTaskReferences(result.data)
      }
    }

    void loadLogs()
    void loadTaskReferences()
  }, [auth, loadLogs])

  async function handleSaveTask(values: TaskFormValues) {
    setSaving(true)
    const result = await saveTask(values, auth)
    setSaving(false)

    if (result.error) {
      return result
    }

    setIsTaskFormOpen(false)
    return result
  }

  const leadReference = taskReferences.leads.find((lead) => lead.id === leadId)
  const initialTaskValues = createTaskValuesFromLead(
    leadId,
    leadReference?.assigned_user_id ?? user?.id,
  )

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-950">
            Görüşme Geçmişi
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            {logs.length} kayıt
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsTaskFormOpen(true)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
        >
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          Görev Oluştur
        </button>
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
            const logUser = getCallLogUser(log)

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
                    {logUser?.full_name ?? 'Personel yok'}
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

      <TaskForm
        authUserId={user?.id ?? null}
        editingTask={null}
        initialValues={initialTaskValues}
        isAdmin={isAdmin}
        isOpen={isTaskFormOpen}
        references={taskReferences}
        saving={saving}
        onClose={() => setIsTaskFormOpen(false)}
        onSubmit={handleSaveTask}
      />
    </section>
  )
}
