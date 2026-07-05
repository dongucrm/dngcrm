import { X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import type {
  StudentFormValues,
  StudentRecord,
  StudentReferences,
} from '../types'

type StudentFormProps = {
  editingStudent: StudentRecord | null
  initialParentId?: string
  isOpen: boolean
  references: StudentReferences
  saving: boolean
  onClose: () => void
  onSubmit: (
    values: StudentFormValues,
    editingStudent?: StudentRecord | null,
  ) => Promise<{ data?: StudentRecord; error?: string }>
}

type FormState = {
  age: string
  birth_date: string
  full_name: string
  notes: string
  parent_id: string
  school: string
}

const defaultFormState: FormState = {
  age: '',
  birth_date: '',
  full_name: '',
  notes: '',
  parent_id: '',
  school: '',
}

function getInitialState(
  editingStudent: StudentRecord | null,
  initialParentId?: string,
): FormState {
  if (!editingStudent) {
    return {
      ...defaultFormState,
      parent_id: initialParentId ?? '',
    }
  }

  return {
    age: editingStudent.age ? String(editingStudent.age) : '',
    birth_date: editingStudent.birth_date ?? '',
    full_name: editingStudent.full_name,
    notes: editingStudent.notes ?? '',
    parent_id: editingStudent.parent_id ?? '',
    school: editingStudent.school ?? '',
  }
}

export function StudentForm({
  editingStudent,
  initialParentId,
  isOpen,
  onClose,
  onSubmit,
  references,
  saving,
}: StudentFormProps) {
  const [form, setForm] = useState<FormState>(defaultFormState)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setForm(getInitialState(editingStudent, initialParentId))
      setFormError(null)
    }
  }, [editingStudent, initialParentId, isOpen])

  if (!isOpen) {
    return null
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setFormError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.full_name.trim()) {
      setFormError('Öğrenci adı soyadı zorunludur.')
      return
    }

    if (!form.parent_id) {
      setFormError('Veli seçmelisiniz.')
      return
    }

    const age = form.age ? Number(form.age) : undefined

    const result = await onSubmit(
      {
        age,
        birth_date: form.birth_date,
        full_name: form.full_name,
        notes: form.notes,
        parent_id: form.parent_id,
        school: form.school,
      },
      editingStudent,
    )

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
            <p className="text-sm font-medium text-emerald-700">Öğrenci</p>
            <h2 className="text-lg font-semibold text-neutral-950">
              {editingStudent ? 'Öğrenci düzenle' : 'Yeni öğrenci ekle'}
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
                Öğrenci adı soyadı
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
              <span className="text-sm font-medium text-neutral-700">Veli</span>
              <select
                required
                value={form.parent_id}
                onChange={(event) =>
                  updateField('parent_id', event.target.value)
                }
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">Veli seçin</option>
                {references.parents.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.full_name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">Yaş</span>
              <input
                type="number"
                min={0}
                value={form.age}
                onChange={(event) => updateField('age', event.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Doğum tarihi
              </span>
              <input
                type="date"
                value={form.birth_date}
                onChange={(event) =>
                  updateField('birth_date', event.target.value)
                }
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-neutral-700">Okul</span>
              <input
                value={form.school}
                onChange={(event) => updateField('school', event.target.value)}
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
