import { PhoneCall, ListChecks, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import type { LeadPriority, TaskStatus } from '../../types/database'
import {
  callStatusLabels,
  leadPriorityLabels,
  taskStatusLabels,
} from '../../utils/labels'
import {
  callStatusOptions,
  leadPriorityOptions,
  taskStatusOptions,
} from './constants'
import type {
  CallLogFormValues,
  LeadQuickAction,
  LeadTaskFormValues,
} from './types'

type LeadQuickActionModalProps = {
  action: LeadQuickAction | null
  saving: boolean
  onClose: () => void
  onCreateCallLog: (
    values: CallLogFormValues,
  ) => Promise<{ success: boolean; error?: string }>
  onCreateTask: (
    values: LeadTaskFormValues,
  ) => Promise<{ success: boolean; error?: string }>
}

export function LeadQuickActionModal({
  action,
  onClose,
  onCreateCallLog,
  onCreateTask,
  saving,
}: LeadQuickActionModalProps) {
  const [callForm, setCallForm] = useState<CallLogFormValues>({
    call_status: 'arandi',
    next_call_date: '',
    notes: '',
  })
  const [taskForm, setTaskForm] = useState<LeadTaskFormValues>({
    description: '',
    due_date: '',
    priority: 'orta',
    status: 'bekliyor',
    title: '',
  })
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (action) {
      setFormError(null)
      setCallForm({
        call_status: 'arandi',
        next_call_date: '',
        notes: '',
      })
      setTaskForm({
        description: '',
        due_date: '',
        priority: 'orta',
        status: 'bekliyor',
        title:
          action.type === 'task'
            ? `${action.lead.full_name} için takip görevi`
            : '',
      })
    }
  }, [action])

  if (!action) {
    return null
  }

  const isCallAction = action.type === 'call'
  const Icon = isCallAction ? PhoneCall : ListChecks
  const title = isCallAction ? 'Arama kaydı ekle' : 'Görev oluştur'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const result = isCallAction
      ? await onCreateCallLog(callForm)
      : await onCreateTask(taskForm)

    if (!result.success) {
      setFormError(result.error ?? 'İşlem tamamlanamadı.')
      return
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-neutral-950/40 px-4 py-6">
      <section className="w-full max-w-lg rounded-lg border border-neutral-200 bg-white shadow-lg">
        <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-neutral-950">
                {title}
              </h2>
              <p className="truncate text-sm text-neutral-500">
                {action.lead.full_name}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Kapat"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            onClick={onClose}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-5 py-5">
            {isCallAction ? (
              <>
                <label className="block">
                  <span className="text-sm font-medium text-neutral-700">
                    Arama durumu
                  </span>
                  <select
                    value={callForm.call_status}
                    onChange={(event) =>
                      setCallForm((current) => ({
                        ...current,
                        call_status: event.target.value,
                      }))
                    }
                    className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    {callStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {callStatusLabels[status]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-neutral-700">
                    Sonraki arama tarihi
                  </span>
                  <input
                    type="datetime-local"
                    value={callForm.next_call_date}
                    onChange={(event) =>
                      setCallForm((current) => ({
                        ...current,
                        next_call_date: event.target.value,
                      }))
                    }
                    className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-neutral-700">
                    Notlar
                  </span>
                  <textarea
                    rows={4}
                    value={callForm.notes}
                    onChange={(event) =>
                      setCallForm((current) => ({
                        ...current,
                        notes: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
              </>
            ) : (
              <>
                <label className="block">
                  <span className="text-sm font-medium text-neutral-700">
                    Görev başlığı
                  </span>
                  <input
                    required
                    value={taskForm.title}
                    onChange={(event) =>
                      setTaskForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-neutral-700">
                      Öncelik
                    </span>
                    <select
                      value={taskForm.priority}
                      onChange={(event) =>
                        setTaskForm((current) => ({
                          ...current,
                          priority: event.target.value as LeadPriority,
                        }))
                      }
                      className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    >
                      {leadPriorityOptions.map((priority) => (
                        <option key={priority} value={priority}>
                          {leadPriorityLabels[priority]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-neutral-700">
                      Durum
                    </span>
                    <select
                      value={taskForm.status}
                      onChange={(event) =>
                        setTaskForm((current) => ({
                          ...current,
                          status: event.target.value as TaskStatus,
                        }))
                      }
                      className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    >
                      {taskStatusOptions.map((status) => (
                        <option key={status} value={status}>
                          {taskStatusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="text-sm font-medium text-neutral-700">
                    Bitiş tarihi
                  </span>
                  <input
                    type="datetime-local"
                    value={taskForm.due_date}
                    onChange={(event) =>
                      setTaskForm((current) => ({
                        ...current,
                        due_date: event.target.value,
                      }))
                    }
                    className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-neutral-700">
                    Açıklama
                  </span>
                  <textarea
                    rows={4}
                    value={taskForm.description}
                    onChange={(event) =>
                      setTaskForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
              </>
            )}

            {formError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {formError}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 border-t border-neutral-200 px-5 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
