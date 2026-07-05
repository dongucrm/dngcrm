import { PhoneCall, X } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { callStatusLabels } from '../../../utils/labels'
import {
  isPastDateTimeLocal,
  toDateTimeLocalValue,
} from '../../../utils/date'
import { callStatusOptions } from '../constants'
import type {
  CallLogFormValues,
  CallLogRecord,
  CallReferences,
  CallTargetRecord,
} from '../types'

type CallLogFormProps = {
  authUserId: string | null
  editingLog: CallLogRecord | null
  initialLead: CallTargetRecord | null
  initialParent?: CallReferences['parents'][number] | null
  isAdmin: boolean
  isOpen: boolean
  references: CallReferences
  saving: boolean
  onClose: () => void
  onSubmit: (
    values: CallLogFormValues,
    editingLog?: CallLogRecord | null,
  ) => Promise<{ data?: CallLogRecord; error?: string }>
}

function getNowLocalValue() {
  return toDateTimeLocalValue(new Date().toISOString())
}

export function CallLogForm({
  authUserId,
  editingLog,
  initialLead,
  initialParent = null,
  isAdmin,
  isOpen,
  onClose,
  onSubmit,
  references,
  saving,
}: CallLogFormProps) {
  const [form, setForm] = useState<CallLogFormValues>({
    call_date: getNowLocalValue(),
    call_status: 'arandi',
    lead_id: '',
    next_call_date: '',
    notes: '',
    parent_id: '',
    sync_notes_to_lead: true,
    user_id: authUserId ?? '',
  })
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setFormError(null)

    if (editingLog) {
      setForm({
        call_date: toDateTimeLocalValue(editingLog.call_date),
        call_status: editingLog.call_status ?? 'arandi',
        lead_id: editingLog.lead_id ?? '',
        next_call_date: toDateTimeLocalValue(editingLog.next_call_date),
        notes: editingLog.notes ?? '',
        parent_id: editingLog.parent_id ?? '',
        sync_notes_to_lead: true,
        user_id: editingLog.user_id ?? authUserId ?? '',
      })
      return
    }

    setForm({
      call_date: getNowLocalValue(),
      call_status: 'arandi',
      lead_id: initialLead?.id ?? '',
      next_call_date: toDateTimeLocalValue(initialLead?.next_call_date),
      notes: '',
      parent_id: initialParent?.id ?? '',
      sync_notes_to_lead: true,
      user_id: authUserId ?? '',
    })
  }, [authUserId, editingLog, initialLead, initialParent, isOpen])

  const selectedLead = useMemo(
    () => references.leads.find((lead) => lead.id === form.lead_id) ?? null,
    [form.lead_id, references.leads],
  )
  const selectedParent = useMemo(
    () =>
      references.parents.find((parent) => parent.id === form.parent_id) ?? null,
    [form.parent_id, references.parents],
  )
  const selectedPhone = selectedLead?.phone ?? selectedParent?.phone ?? ''

  if (!isOpen) {
    return null
  }

  function updateForm<K extends keyof CallLogFormValues>(
    key: K,
    value: CallLogFormValues[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }))
    setFormError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.lead_id && !form.parent_id) {
      setFormError('Lead veya veli seçmelisiniz.')
      return
    }

    if (!selectedPhone) {
      setFormError('Telefon numarası zorunludur.')
      return
    }

    if (!form.notes.trim()) {
      setFormError('Görüşme notu boş bırakılamaz.')
      return
    }

    if (form.next_call_date && isPastDateTimeLocal(form.next_call_date)) {
      setFormError('Sonraki arama tarihi geçmiş bir tarih olamaz.')
      return
    }

    const result = await onSubmit(form, editingLog)

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
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <PhoneCall className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-emerald-700">
                Arama Listesi
              </p>
              <h2 className="truncate text-lg font-semibold text-neutral-950">
                {editingLog ? 'Arama kaydı düzenle' : 'Arama kaydı ekle'}
              </h2>
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
          <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-neutral-700">Lead</span>
              <select
                value={form.lead_id}
                onChange={(event) => {
                  updateForm('lead_id', event.target.value)
                  if (event.target.value) {
                    updateForm('parent_id', '')
                  }
                }}
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">Lead seçilmedi</option>
                {references.leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.full_name} - {lead.phone}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">Veli</span>
              <select
                value={form.parent_id}
                onChange={(event) => {
                  updateForm('parent_id', event.target.value)
                  if (event.target.value) {
                    updateForm('lead_id', '')
                  }
                }}
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">Veli seçilmedi</option>
                {references.parents.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.full_name} - {parent.phone}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Arayan personel
              </span>
              <select
                value={form.user_id}
                disabled={!isAdmin}
                onChange={(event) => updateForm('user_id', event.target.value)}
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
                Arama durumu
              </span>
              <select
                value={form.call_status}
                onChange={(event) =>
                  updateForm(
                    'call_status',
                    event.target.value as CallLogFormValues['call_status'],
                  )
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
                Arama tarihi
              </span>
              <input
                type="datetime-local"
                value={form.call_date}
                onChange={(event) => updateForm('call_date', event.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Sonraki arama tarihi
              </span>
              <input
                type="datetime-local"
                value={form.next_call_date}
                onChange={(event) =>
                  updateForm('next_call_date', event.target.value)
                }
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 md:col-span-2">
              <p className="text-xs font-medium text-neutral-500">Telefon</p>
              <p className="mt-1 text-sm font-semibold text-neutral-900">
                {selectedPhone || 'Lead veya veli seçildiğinde görünür'}
              </p>
            </div>

            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-neutral-700">
                Görüşme notu
              </span>
              <textarea
                required
                rows={4}
                value={form.notes}
                onChange={(event) => updateForm('notes', event.target.value)}
                className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="flex items-center gap-2 md:col-span-2">
              <input
                type="checkbox"
                checked={form.sync_notes_to_lead}
                disabled={!form.lead_id}
                onChange={(event) =>
                  updateForm('sync_notes_to_lead', event.target.checked)
                }
                className="h-4 w-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-medium text-neutral-700">
                Görüşme notunu lead notlarına da ekle
              </span>
            </label>
          </div>

          {formError ? (
            <p className="mx-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
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
