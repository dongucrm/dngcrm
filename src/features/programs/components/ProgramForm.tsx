import { X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import type { ProgramType } from '../../../types/database'
import { programTypeLabels } from '../../../utils/labels'
import { programTypeOptions } from '../constants'
import { toProgramFormValues } from '../services/programService'
import type { ProgramFormValues, ProgramRecord } from '../types'

type ProgramFormProps = {
  editingProgram: ProgramRecord | null
  isOpen: boolean
  saving: boolean
  onClose: () => void
  onSubmit: (
    values: ProgramFormValues,
    editingProgram?: ProgramRecord | null,
  ) => Promise<{ data?: ProgramRecord; error?: string }>
}

type FormState = {
  description: string
  end_date: string
  is_active: boolean
  name: string
  notes: string
  price: string
  quota: string
  start_date: string
  type: ProgramType
}

const defaultFormState: FormState = {
  description: '',
  end_date: '',
  is_active: true,
  name: '',
  notes: '',
  price: '0',
  quota: '',
  start_date: '',
  type: 'kamp',
}

function getInitialState(program: ProgramRecord | null): FormState {
  if (!program) {
    return defaultFormState
  }

  const values = toProgramFormValues(program)

  return {
    description: values.description ?? '',
    end_date: values.end_date ?? '',
    is_active: values.is_active,
    name: values.name,
    notes: values.notes ?? '',
    price: String(values.price ?? 0),
    quota: values.quota ? String(values.quota) : '',
    start_date: values.start_date ?? '',
    type: values.type,
  }
}

export function ProgramForm({
  editingProgram,
  isOpen,
  onClose,
  onSubmit,
  saving,
}: ProgramFormProps) {
  const [form, setForm] = useState<FormState>(defaultFormState)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setForm(getInitialState(editingProgram))
      setFormError(null)
    }
  }, [editingProgram, isOpen])

  if (!isOpen) {
    return null
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setFormError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.name.trim()) {
      setFormError('Program adı zorunludur.')
      return
    }

    const result = await onSubmit(
      {
        description: form.description,
        end_date: form.end_date || undefined,
        is_active: form.is_active,
        name: form.name,
        notes: form.notes,
        price: Number(form.price || 0),
        quota: form.quota ? Number(form.quota) : undefined,
        start_date: form.start_date || undefined,
        type: form.type,
      },
      editingProgram,
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
            <p className="text-sm font-medium text-emerald-700">Program</p>
            <h2 className="text-lg font-semibold text-neutral-950">
              {editingProgram ? 'Program düzenle' : 'Yeni program oluştur'}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Kapat"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-neutral-700">
                Program adı
              </span>
              <input
                required
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">Tip</span>
              <select
                value={form.type}
                onChange={(event) =>
                  updateField('type', event.target.value as ProgramType)
                }
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                {programTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {programTypeLabels[type]}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Durum
              </span>
              <select
                value={form.is_active ? 'active' : 'passive'}
                onChange={(event) =>
                  updateField('is_active', event.target.value === 'active')
                }
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="active">Aktif</option>
                <option value="passive">Pasif</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Başlangıç tarihi
              </span>
              <input
                type="date"
                value={form.start_date}
                onChange={(event) =>
                  updateField('start_date', event.target.value)
                }
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Bitiş tarihi
              </span>
              <input
                type="date"
                value={form.end_date}
                onChange={(event) => updateField('end_date', event.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Fiyat
              </span>
              <input
                min={0}
                type="number"
                value={form.price}
                onChange={(event) => updateField('price', event.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Kontenjan
              </span>
              <input
                min={0}
                type="number"
                value={form.quota}
                onChange={(event) => updateField('quota', event.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-neutral-700">
                Açıklama
              </span>
              <textarea
                rows={3}
                value={form.description}
                onChange={(event) =>
                  updateField('description', event.target.value)
                }
                className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-neutral-700">Notlar</span>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(event) => updateField('notes', event.target.value)}
                className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
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
