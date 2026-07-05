import { X } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { RegistrationStatus } from '../../../types/database'
import { registrationStatusLabels } from '../../../utils/labels'
import { registrationStatusOptions } from '../constants'
import {
  getDefaultRegistrationValues,
  toRegistrationFormValues,
} from '../services/registrationService'
import type {
  RegistrationFormValues,
  RegistrationRecord,
  RegistrationReferences,
  RegistrationSaveOptions,
} from '../types'

type RegistrationFormProps = {
  editingRegistration: RegistrationRecord | null
  initialValues?: Partial<RegistrationFormValues>
  isAdmin: boolean
  isOpen: boolean
  references: RegistrationReferences
  saving: boolean
  onClose: () => void
  onSubmit: (
    values: RegistrationFormValues,
    editingRegistration?: RegistrationRecord | null,
    options?: RegistrationSaveOptions,
  ) => Promise<{ data?: RegistrationRecord; error?: string }>
}

type FormState = {
  discount_amount: string
  final_price: string
  notes: string
  parent_id: string
  program_id: string
  registration_date: string
  status: RegistrationStatus
  student_id: string
  total_price: string
}

function toFormState(values: RegistrationFormValues): FormState {
  return {
    discount_amount: String(values.discount_amount ?? 0),
    final_price: String(values.final_price ?? 0),
    notes: values.notes ?? '',
    parent_id: values.parent_id ?? '',
    program_id: values.program_id ?? '',
    registration_date:
      values.registration_date ?? new Date().toISOString().slice(0, 10),
    status: values.status,
    student_id: values.student_id ?? '',
    total_price: String(values.total_price ?? 0),
  }
}

export function RegistrationForm({
  editingRegistration,
  initialValues,
  isAdmin,
  isOpen,
  onClose,
  onSubmit,
  references,
  saving,
}: RegistrationFormProps) {
  const [form, setForm] = useState<FormState>(
    toFormState(getDefaultRegistrationValues()),
  )
  const [formError, setFormError] = useState<string | null>(null)
  const [allowCapacityOverride, setAllowCapacityOverride] = useState(false)
  const initialParentId = initialValues?.parent_id
  const initialProgramId = initialValues?.program_id
  const initialSourceLeadId = initialValues?.source_lead_id
  const initialStudentId = initialValues?.student_id

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const values = editingRegistration
      ? toRegistrationFormValues(editingRegistration)
      : getDefaultRegistrationValues({
          parent_id: initialParentId,
          program_id: initialProgramId,
          source_lead_id: initialSourceLeadId,
          student_id: initialStudentId,
        })

    setForm(toFormState(values))
    setFormError(null)
    setAllowCapacityOverride(false)
  }, [
    editingRegistration,
    initialParentId,
    initialProgramId,
    initialSourceLeadId,
    initialStudentId,
    isOpen,
  ])

  const filteredStudents = useMemo(() => {
    if (!form.parent_id) {
      return references.students
    }

    return references.students.filter(
      (student) => student.parent_id === form.parent_id,
    )
  }, [form.parent_id, references.students])

  const selectedProgram = references.programs.find(
    (program) => program.id === form.program_id,
  )

  if (!isOpen) {
    return null
  }

  function calculateFinalPrice(total: string, discount: string) {
    return String(Math.max(Number(total || 0) - Number(discount || 0), 0))
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => {
      const next = { ...current, [key]: value }

      if (key === 'parent_id') {
        const stillValidStudent = references.students.some(
          (student) =>
            student.id === current.student_id && student.parent_id === value,
        )
        next.student_id = stillValidStudent ? current.student_id : ''
      }

      if (key === 'program_id') {
        const program = references.programs.find(
          (referenceProgram) => referenceProgram.id === value,
        )
        const price = String(Number(program?.price ?? 0))
        next.total_price = price
        next.final_price = calculateFinalPrice(price, next.discount_amount)
      }

      if (key === 'total_price' || key === 'discount_amount') {
        next.final_price = calculateFinalPrice(
          key === 'total_price' ? value : next.total_price,
          key === 'discount_amount' ? value : next.discount_amount,
        )
      }

      return next
    })
    setFormError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.parent_id || !form.student_id || !form.program_id) {
      setFormError('Veli, öğrenci ve program seçmelisiniz.')
      return
    }

    if (Number(form.final_price || 0) < 0) {
      setFormError('Net fiyat sıfırın altında olamaz.')
      return
    }

    const result = await onSubmit(
      {
        discount_amount: Number(form.discount_amount || 0),
        final_price: Number(form.final_price || 0),
        notes: form.notes,
        parent_id: form.parent_id,
        program_id: form.program_id,
        registration_date: form.registration_date,
        status: form.status,
        student_id: form.student_id,
        total_price: Number(form.total_price || 0),
        ...(initialValues?.source_lead_id
          ? { source_lead_id: initialValues.source_lead_id }
          : {}),
      },
      editingRegistration,
      { allowCapacityOverride },
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
            <p className="text-sm font-medium text-emerald-700">Kayıt</p>
            <h2 className="text-lg font-semibold text-neutral-950">
              {editingRegistration ? 'Kayıt düzenle' : 'Yeni kayıt oluştur'}
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
              <span className="text-sm font-medium text-neutral-700">Veli</span>
              <select
                required
                value={form.parent_id}
                onChange={(event) => updateField('parent_id', event.target.value)}
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
              <span className="text-sm font-medium text-neutral-700">
                Öğrenci
              </span>
              <select
                required
                value={form.student_id}
                onChange={(event) => updateField('student_id', event.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">Öğrenci seçin</option>
                {filteredStudents.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.full_name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Program
              </span>
              <select
                required
                value={form.program_id}
                onChange={(event) => updateField('program_id', event.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">Program seçin</option>
                {references.programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
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
                  updateField('status', event.target.value as RegistrationStatus)
                }
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                {registrationStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {registrationStatusLabels[status]}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Kayıt tarihi
              </span>
              <input
                type="date"
                value={form.registration_date}
                onChange={(event) =>
                  updateField('registration_date', event.target.value)
                }
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Toplam fiyat
              </span>
              <input
                min={0}
                type="number"
                value={form.total_price}
                onChange={(event) =>
                  updateField('total_price', event.target.value)
                }
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                İndirim
              </span>
              <input
                min={0}
                type="number"
                value={form.discount_amount}
                onChange={(event) =>
                  updateField('discount_amount', event.target.value)
                }
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Net fiyat
              </span>
              <input
                min={0}
                type="number"
                value={form.final_price}
                onChange={(event) =>
                  updateField('final_price', event.target.value)
                }
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-neutral-700">Notlar</span>
              <textarea
                rows={4}
                value={form.notes}
                onChange={(event) => updateField('notes', event.target.value)}
                className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          </div>

          {selectedProgram?.quota ? (
            <p className="mx-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
              Bu programın kontenjan limiti {selectedProgram.quota}. Doluluk
              kaydetme sırasında kontrol edilir.
            </p>
          ) : null}

          {isAdmin ? (
            <label className="mx-5 mt-3 flex items-center gap-2 text-sm font-medium text-neutral-700">
              <input
                type="checkbox"
                checked={allowCapacityOverride}
                onChange={(event) =>
                  setAllowCapacityOverride(event.target.checked)
                }
                className="h-4 w-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
              />
              Kontenjan doluysa admin olarak devam et
            </label>
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
