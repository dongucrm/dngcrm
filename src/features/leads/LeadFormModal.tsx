import { X } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type {
  LeadPriority,
  LeadProbability,
  LeadStatus,
  Program,
} from '../../types/database'
import {
  leadPriorityLabels,
  leadProbabilityLabels,
  leadStatusLabels,
} from '../../utils/labels'
import {
  leadPriorityOptions,
  leadProbabilityOptions,
  leadSourceOptions,
  leadStatusOptions,
} from './constants'
import type { LeadAssignee, LeadFormValues, LeadRecord } from './types'
import { fromDateTimeLocalValue, toDateTimeLocalValue } from './utils'

type LeadFormModalProps = {
  assignees: LeadAssignee[]
  isAdmin: boolean
  isOpen: boolean
  lead: LeadRecord | null
  programs: Program[]
  saving: boolean
  onClose: () => void
  onPassive: (lead: LeadRecord) => Promise<{ success: boolean; error?: string }>
  onSubmit: (
    values: LeadFormValues,
    lead?: LeadRecord,
  ) => Promise<{ success: boolean; error?: string }>
}

type FormState = {
  assigned_user_id: string
  child_age: string
  child_name: string
  email: string
  full_name: string
  interested_program_id: string
  last_contact_date: string
  next_call_date: string
  notes: string
  phone: string
  priority: LeadPriority
  probability: LeadProbability
  source: string
  status: LeadStatus
}

const defaultFormState: FormState = {
  assigned_user_id: '',
  child_age: '',
  child_name: '',
  email: '',
  full_name: '',
  interested_program_id: '',
  last_contact_date: '',
  next_call_date: '',
  notes: '',
  phone: '',
  priority: 'orta',
  probability: 'orta',
  source: '',
  status: 'yeni_lead',
}

function getInitialFormState(lead: LeadRecord | null): FormState {
  if (!lead) {
    return defaultFormState
  }

  return {
    assigned_user_id: lead.assigned_user_id ?? '',
    child_age: lead.child_age ? String(lead.child_age) : '',
    child_name: lead.child_name ?? '',
    email: lead.email ?? '',
    full_name: lead.full_name,
    interested_program_id: lead.interested_program_id ?? '',
    last_contact_date: toDateTimeLocalValue(lead.last_contact_date),
    next_call_date: toDateTimeLocalValue(lead.next_call_date),
    notes: lead.notes ?? '',
    phone: lead.phone,
    priority: lead.priority ?? 'orta',
    probability: lead.probability ?? 'orta',
    source: lead.source ?? '',
    status: lead.status ?? 'yeni_lead',
  }
}

export function LeadFormModal({
  assignees,
  isAdmin,
  isOpen,
  lead,
  onClose,
  onPassive,
  onSubmit,
  programs,
  saving,
}: LeadFormModalProps) {
  const [formState, setFormState] = useState(defaultFormState)
  const [formError, setFormError] = useState<string | null>(null)

  const isEditMode = Boolean(lead)
  const isRestrictedEdit = isEditMode && !isAdmin
  const title = isEditMode ? 'Lead düzenle' : 'Yeni lead ekle'

  const sourceOptions = useMemo(() => {
    const sources = new Set(leadSourceOptions)

    if (formState.source) {
      sources.add(formState.source)
    }

    return Array.from(sources)
  }, [formState.source])

  useEffect(() => {
    if (isOpen) {
      setFormState(getInitialFormState(lead))
      setFormError(null)
    }
  }, [isOpen, lead])

  if (!isOpen) {
    return null
  }

  function updateField<K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) {
    setFormState((current) => ({ ...current, [key]: value }))
    setFormError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = await onSubmit(
      {
        assigned_user_id: formState.assigned_user_id || undefined,
        child_age: formState.child_age
          ? Number.parseInt(formState.child_age, 10)
          : undefined,
        child_name: formState.child_name,
        email: formState.email,
        full_name: formState.full_name,
        interested_program_id: formState.interested_program_id || undefined,
        last_contact_date: fromDateTimeLocalValue(formState.last_contact_date),
        next_call_date: fromDateTimeLocalValue(formState.next_call_date),
        notes: formState.notes,
        phone: formState.phone,
        priority: formState.priority,
        probability: formState.probability,
        source: formState.source,
        status: formState.status,
      },
      lead ?? undefined,
    )

    if (!result.success) {
      setFormError(result.error ?? 'Lead kaydedilemedi.')
      return
    }

    onClose()
  }

  async function handlePassive() {
    if (!lead) {
      return
    }

    const result = await onPassive(lead)

    if (!result.success) {
      setFormError(result.error ?? 'Lead durumu güncellenemedi.')
      return
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-neutral-950/40 px-4 py-6">
      <section className="w-full max-w-4xl rounded-lg border border-neutral-200 bg-white shadow-lg">
        <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-5 py-4">
          <div>
            <p className="text-sm font-medium text-emerald-700">
              Lead / Potansiyel Müşteri
            </p>
            <h2 className="text-lg font-semibold text-neutral-950">{title}</h2>
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
            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Veli adı soyadı
              </span>
              <input
                required
                disabled={isRestrictedEdit}
                value={formState.full_name}
                onChange={(event) =>
                  updateField('full_name', event.target.value)
                }
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-neutral-50 disabled:text-neutral-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Telefon
              </span>
              <input
                required
                disabled={isRestrictedEdit}
                value={formState.phone}
                onChange={(event) => updateField('phone', event.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-neutral-50 disabled:text-neutral-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Email
              </span>
              <input
                type="email"
                disabled={isRestrictedEdit}
                value={formState.email}
                onChange={(event) => updateField('email', event.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-neutral-50 disabled:text-neutral-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Kaynak
              </span>
              <input
                list="lead-source-options"
                disabled={isRestrictedEdit}
                value={formState.source}
                onChange={(event) => updateField('source', event.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-neutral-50 disabled:text-neutral-500"
              />
              <datalist id="lead-source-options">
                {sourceOptions.map((source) => (
                  <option key={source} value={source} />
                ))}
              </datalist>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Çocuk adı
              </span>
              <input
                disabled={isRestrictedEdit}
                value={formState.child_name}
                onChange={(event) =>
                  updateField('child_name', event.target.value)
                }
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-neutral-50 disabled:text-neutral-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Çocuk yaşı
              </span>
              <input
                type="number"
                min="0"
                disabled={isRestrictedEdit}
                value={formState.child_age}
                onChange={(event) =>
                  updateField('child_age', event.target.value)
                }
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-neutral-50 disabled:text-neutral-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                İlgilendiği program
              </span>
              <select
                disabled={isRestrictedEdit}
                value={formState.interested_program_id}
                onChange={(event) =>
                  updateField('interested_program_id', event.target.value)
                }
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-neutral-50 disabled:text-neutral-500"
              >
                <option value="">Program seçilmedi</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Satış aşaması
              </span>
              <select
                value={formState.status}
                onChange={(event) =>
                  updateField('status', event.target.value as LeadStatus)
                }
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                {leadStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {leadStatusLabels[status]}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Öncelik
              </span>
              <select
                disabled={isRestrictedEdit}
                value={formState.priority}
                onChange={(event) =>
                  updateField('priority', event.target.value as LeadPriority)
                }
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-neutral-50 disabled:text-neutral-500"
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
                Kayıt ihtimali
              </span>
              <select
                disabled={isRestrictedEdit}
                value={formState.probability}
                onChange={(event) =>
                  updateField(
                    'probability',
                    event.target.value as LeadProbability,
                  )
                }
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-neutral-50 disabled:text-neutral-500"
              >
                {leadProbabilityOptions.map((probability) => (
                  <option key={probability} value={probability}>
                    {leadProbabilityLabels[probability]}
                  </option>
                ))}
              </select>
            </label>

            {isAdmin ? (
              <label className="block">
                <span className="text-sm font-medium text-neutral-700">
                  Atanan personel
                </span>
                <select
                  value={formState.assigned_user_id}
                  onChange={(event) =>
                    updateField('assigned_user_id', event.target.value)
                  }
                  className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="">Atanmadı</option>
                  {assignees.map((assignee) => (
                    <option key={assignee.id} value={assignee.id}>
                      {assignee.full_name || 'İsimsiz kullanıcı'}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Son görüşme tarihi
              </span>
              <input
                type="datetime-local"
                disabled={isRestrictedEdit}
                value={formState.last_contact_date}
                onChange={(event) =>
                  updateField('last_contact_date', event.target.value)
                }
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-neutral-50 disabled:text-neutral-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Sonraki arama tarihi
              </span>
              <input
                type="datetime-local"
                value={formState.next_call_date}
                onChange={(event) =>
                  updateField('next_call_date', event.target.value)
                }
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-neutral-700">
                Notlar
              </span>
              <textarea
                value={formState.notes}
                onChange={(event) => updateField('notes', event.target.value)}
                rows={4}
                className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          </div>

          {isRestrictedEdit ? (
            <p className="mx-5 rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
              Satış personeli mevcut lead üzerinde yalnızca satış aşaması, not
              ve sonraki arama tarihini güncelleyebilir.
            </p>
          ) : null}

          {formError ? (
            <p className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {formError}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {lead && lead.status !== 'vazgecti' ? (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void handlePassive()}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Vazgeçti yap
                </button>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
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
          </div>
        </form>
      </section>
    </div>
  )
}
