import { X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import type { LeadPriority, TaskStatus } from '../../../types/database'
import {
  fromDateTimeLocalValue,
  isPastDateTimeLocal,
  toDateTimeLocalValue,
} from '../../../utils/date'
import { leadPriorityLabels, taskStatusLabels } from '../../../utils/labels'
import { taskPriorityOptions, taskStatusOptions } from '../constants'
import type { TaskFormValues, TaskRecord, TaskReferences } from '../types'
import { toTaskFormValues } from '../services/taskService'

type TaskFormProps = {
  authUserId: string | null
  editingTask: TaskRecord | null
  initialValues?: Partial<TaskFormValues>
  isAdmin: boolean
  isOpen: boolean
  references: TaskReferences
  saving: boolean
  onClose: () => void
  onSubmit: (
    values: TaskFormValues,
    editingTask?: TaskRecord | null,
  ) => Promise<{ data?: TaskRecord; error?: string }>
}

type FormState = {
  assigned_user_id: string
  description: string
  due_date: string
  priority: LeadPriority
  related_lead_id: string
  related_parent_id: string
  status: TaskStatus
  title: string
}

const defaultFormState: FormState = {
  assigned_user_id: '',
  description: '',
  due_date: '',
  priority: 'orta',
  related_lead_id: '',
  related_parent_id: '',
  status: 'bekliyor',
  title: '',
}

function getInitialFormState(
  authUserId: string | null,
  editingTask: TaskRecord | null,
  initialValues?: Partial<TaskFormValues>,
): FormState {
  if (editingTask) {
    const values = toTaskFormValues(editingTask)

    return {
      assigned_user_id: values.assigned_user_id ?? '',
      description: values.description ?? '',
      due_date: toDateTimeLocalValue(values.due_date),
      priority: values.priority,
      related_lead_id: values.related_lead_id ?? '',
      related_parent_id: values.related_parent_id ?? '',
      status: values.status,
      title: values.title,
    }
  }

  return {
    ...defaultFormState,
    assigned_user_id: initialValues?.assigned_user_id ?? authUserId ?? '',
    description: initialValues?.description ?? '',
    due_date: toDateTimeLocalValue(initialValues?.due_date),
    priority: initialValues?.priority ?? 'orta',
    related_lead_id: initialValues?.related_lead_id ?? '',
    related_parent_id: initialValues?.related_parent_id ?? '',
    status: initialValues?.status ?? 'bekliyor',
    title: initialValues?.title ?? '',
  }
}

export function TaskForm({
  authUserId,
  editingTask,
  initialValues,
  isAdmin,
  isOpen,
  onClose,
  onSubmit,
  references,
  saving,
}: TaskFormProps) {
  const [form, setForm] = useState<FormState>(defaultFormState)
  const [formError, setFormError] = useState<string | null>(null)
  const [pastWarning, setPastWarning] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setForm(getInitialFormState(authUserId, editingTask, initialValues))
      setFormError(null)
      setPastWarning(null)
    }
  }, [authUserId, editingTask, initialValues, isOpen])

  if (!isOpen) {
    return null
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setFormError(null)

    if (key === 'due_date' && value && isPastDateTimeLocal(String(value))) {
      setPastWarning('Son tarih geçmişte. Lütfen tarihi kontrol edin.')
    } else if (key === 'due_date') {
      setPastWarning(null)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.title.trim()) {
      setFormError('Başlık zorunludur.')
      return
    }

    if (!form.due_date) {
      setFormError('Son tarih zorunludur.')
      return
    }

    if (!form.assigned_user_id) {
      setFormError('Atanan personel zorunludur.')
      return
    }

    if (!isAdmin && isPastDateTimeLocal(form.due_date)) {
      setFormError('Geçmiş tarihli görev oluşturamazsınız.')
      return
    }

    const result = await onSubmit(
      {
        assigned_user_id: form.assigned_user_id,
        description: form.description,
        due_date: fromDateTimeLocalValue(form.due_date),
        priority: form.priority,
        related_lead_id: form.related_lead_id || undefined,
        related_parent_id: form.related_parent_id || undefined,
        status: form.status,
        title: form.title,
      },
      editingTask,
    )

    if (result.error) {
      setFormError(result.error)
      return
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-neutral-950/40 px-4 py-6">
      <section className="w-full max-w-3xl rounded-lg border border-neutral-200 bg-white shadow-lg">
        <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-5 py-4">
          <div>
            <p className="text-sm font-medium text-emerald-700">
              Görev / Hatırlatma
            </p>
            <h2 className="text-lg font-semibold text-neutral-950">
              {editingTask ? 'Görev düzenle' : 'Yeni görev oluştur'}
            </h2>
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
          <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-neutral-700">
                Başlık
              </span>
              <input
                required
                value={form.title}
                onChange={(event) => updateField('title', event.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-neutral-700">
                Açıklama
              </span>
              <textarea
                rows={4}
                value={form.description}
                onChange={(event) =>
                  updateField('description', event.target.value)
                }
                className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                İlgili lead
              </span>
              <select
                value={form.related_lead_id}
                onChange={(event) => {
                  updateField('related_lead_id', event.target.value)
                  if (event.target.value) {
                    updateField('related_parent_id', '')
                  }
                }}
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">Lead seçilmedi</option>
                {references.leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.full_name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                İlgili veli
              </span>
              <select
                value={form.related_parent_id}
                onChange={(event) => {
                  updateField('related_parent_id', event.target.value)
                  if (event.target.value) {
                    updateField('related_lead_id', '')
                  }
                }}
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">Veli seçilmedi</option>
                {references.parents.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.full_name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Atanan personel
              </span>
              <select
                value={form.assigned_user_id}
                disabled={!isAdmin}
                onChange={(event) =>
                  updateField('assigned_user_id', event.target.value)
                }
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-neutral-50 disabled:text-neutral-500"
              >
                <option value="">Personel seçin</option>
                {references.profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.full_name || 'İsimsiz kullanıcı'}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Son tarih
              </span>
              <input
                required
                type="datetime-local"
                value={form.due_date}
                onChange={(event) => updateField('due_date', event.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Öncelik
              </span>
              <select
                value={form.priority}
                onChange={(event) =>
                  updateField('priority', event.target.value as LeadPriority)
                }
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                {taskPriorityOptions.map((priority) => (
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
                value={form.status}
                onChange={(event) =>
                  updateField('status', event.target.value as TaskStatus)
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

          {pastWarning ? (
            <p className="mx-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
              {pastWarning}
              {isAdmin ? ' Admin olarak yine de kaydedebilirsiniz.' : ''}
            </p>
          ) : null}

          {formError ? (
            <p className="mx-5 mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {formError}
            </p>
          ) : null}

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
