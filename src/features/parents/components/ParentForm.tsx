import { X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { ParentFormValues, ParentRecord } from '../types'

type ParentFormProps = {
  editingParent: ParentRecord | null
  isOpen: boolean
  saving: boolean
  onClose: () => void
  onSubmit: (
    values: ParentFormValues,
    editingParent?: ParentRecord | null,
  ) => Promise<{
    data?: ParentRecord
    duplicateParent?: ParentRecord
    error?: string
  }>
}

type FormState = {
  address: string
  email: string
  full_name: string
  notes: string
  phone: string
}

const defaultFormState: FormState = {
  address: '',
  email: '',
  full_name: '',
  notes: '',
  phone: '',
}

function getInitialState(parent: ParentRecord | null): FormState {
  if (!parent) {
    return defaultFormState
  }

  return {
    address: parent.address ?? '',
    email: parent.email ?? '',
    full_name: parent.full_name,
    notes: parent.notes ?? '',
    phone: parent.phone,
  }
}

export function ParentForm({
  editingParent,
  isOpen,
  onClose,
  onSubmit,
  saving,
}: ParentFormProps) {
  const [form, setForm] = useState<FormState>(defaultFormState)
  const [formError, setFormError] = useState<string | null>(null)
  const [duplicateParent, setDuplicateParent] = useState<ParentRecord | null>(
    null,
  )

  useEffect(() => {
    if (isOpen) {
      setForm(getInitialState(editingParent))
      setFormError(null)
      setDuplicateParent(null)
    }
  }, [editingParent, isOpen])

  if (!isOpen) {
    return null
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setFormError(null)
    setDuplicateParent(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.full_name.trim() || !form.phone.trim()) {
      setFormError('Veli adı soyadı ve telefon zorunludur.')
      return
    }

    const result = await onSubmit(
      {
        address: form.address,
        email: form.email,
        full_name: form.full_name,
        notes: form.notes,
        phone: form.phone,
      },
      editingParent,
    )

    if (result.duplicateParent) {
      setDuplicateParent(result.duplicateParent)
    }

    if (result.error) {
      setFormError(result.error)
      return
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-neutral-950/40 px-4 py-6">
      <section className="w-full max-w-2xl rounded-lg border border-neutral-200 bg-white shadow-lg">
        <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-5 py-4">
          <div>
            <p className="text-sm font-medium text-emerald-700">Veli</p>
            <h2 className="text-lg font-semibold text-neutral-950">
              {editingParent ? 'Veli düzenle' : 'Yeni veli ekle'}
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
            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Veli adı soyadı
              </span>
              <input
                required
                value={form.full_name}
                onChange={(event) =>
                  updateField('full_name', event.target.value)
                }
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Telefon
              </span>
              <input
                required
                value={form.phone}
                onChange={(event) => updateField('phone', event.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Email
              </span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Adres
              </span>
              <input
                value={form.address}
                onChange={(event) => updateField('address', event.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-neutral-700">
                Notlar
              </span>
              <textarea
                rows={4}
                value={form.notes}
                onChange={(event) => updateField('notes', event.target.value)}
                className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          </div>

          {formError ? (
            <div className="mx-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              <p>{formError}</p>
              {duplicateParent ? (
                <Link
                  to={`/parents/${duplicateParent.id}`}
                  className="mt-2 inline-flex h-9 items-center rounded-lg border border-red-200 bg-white px-3 text-sm font-semibold text-red-700 hover:bg-red-50"
                >
                  Mevcut veliye git
                </Link>
              ) : null}
            </div>
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
