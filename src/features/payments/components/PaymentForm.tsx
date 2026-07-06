import { X } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { PaymentMethod } from '../../../types/database'
import { paymentMethodLabels } from '../../../utils/labels'
import { paymentMethodOptions } from '../constants'
import {
  normalizeRelation,
  toPaymentFormValues,
} from '../services/paymentService'
import type {
  PaymentFormValues,
  PaymentRecord,
  PaymentReferences,
  PaymentRegistration,
} from '../types'

type PaymentFormProps = {
  editingPayment: PaymentRecord | null
  initialRegistrationId?: string
  isAdmin: boolean
  isOpen: boolean
  references: PaymentReferences
  saving: boolean
  onClose: () => void
  onSubmit: (
    values: PaymentFormValues,
    editingPayment?: PaymentRecord | null,
  ) => Promise<{ data?: PaymentRecord; error?: string }>
}

type FormState = {
  first_due_date: string
  installment_count: string
  notes: string
  paid_amount: string
  payment_method: PaymentMethod | ''
  registration_id: string
  remaining_amount: string
  total_amount: string
}

const today = new Date().toISOString().slice(0, 10)

const defaultFormState: FormState = {
  first_due_date: today,
  installment_count: '1',
  notes: '',
  paid_amount: '0',
  payment_method: '',
  registration_id: '',
  remaining_amount: '0',
  total_amount: '0',
}

function getRegistrationLabel(registration: PaymentRegistration) {
  const parent = normalizeRelation(registration.parent)
  const student = normalizeRelation(registration.student)
  const program = normalizeRelation(registration.program)

  return `${parent?.full_name ?? 'Veli yok'} · ${student?.full_name ?? 'Öğrenci yok'} · ${program?.name ?? 'Program yok'}`
}

function getInitialState(
  editingPayment: PaymentRecord | null,
  initialRegistrationId: string | undefined,
  references: PaymentReferences,
): FormState {
  if (editingPayment) {
    const values = toPaymentFormValues(editingPayment)

    return {
      first_due_date: values.first_due_date ?? today,
      installment_count: String(values.installment_count ?? 1),
      notes: values.notes ?? '',
      paid_amount: String(values.paid_amount ?? 0),
      payment_method: values.payment_method ?? '',
      registration_id: values.registration_id ?? '',
      remaining_amount: String(values.remaining_amount ?? 0),
      total_amount: String(values.total_amount ?? 0),
    }
  }

  const registration = references.registrations.find(
    (item) => item.id === initialRegistrationId,
  )
  const totalAmount = Number(registration?.final_price ?? 0)

  return {
    ...defaultFormState,
    registration_id: initialRegistrationId ?? '',
    remaining_amount: String(totalAmount),
    total_amount: String(totalAmount),
  }
}

export function PaymentForm({
  editingPayment,
  initialRegistrationId,
  isAdmin,
  isOpen,
  onClose,
  onSubmit,
  references,
  saving,
}: PaymentFormProps) {
  const [form, setForm] = useState<FormState>(defaultFormState)
  const [formError, setFormError] = useState<string | null>(null)
  const selectedRegistration = useMemo(
    () =>
      references.registrations.find(
        (registration) => registration.id === form.registration_id,
      ),
    [form.registration_id, references.registrations],
  )
  const selectedParent = normalizeRelation(selectedRegistration?.parent)
  const selectedStudent = normalizeRelation(selectedRegistration?.student)
  const selectedProgram = normalizeRelation(selectedRegistration?.program)

  useEffect(() => {
    if (isOpen) {
      setForm(getInitialState(editingPayment, initialRegistrationId, references))
      setFormError(null)
    }
  }, [editingPayment, initialRegistrationId, isOpen, references])

  if (!isOpen) {
    return null
  }

  function calculateRemaining(total: string, paid: string) {
    return String(Math.max(Number(total || 0) - Number(paid || 0), 0))
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => {
      const next = { ...current, [key]: value }

      if (key === 'registration_id') {
        const registration = references.registrations.find(
          (item) => item.id === value,
        )
        const totalAmount = String(Number(registration?.final_price ?? 0))
        next.total_amount = totalAmount
        next.remaining_amount = calculateRemaining(totalAmount, next.paid_amount)
      }

      if (key === 'total_amount' || key === 'paid_amount') {
        next.remaining_amount = calculateRemaining(
          key === 'total_amount' ? value : next.total_amount,
          key === 'paid_amount' ? value : next.paid_amount,
        )
      }

      return next
    })
    setFormError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!isAdmin) {
      setFormError('Ödeme planı yalnızca admin tarafından yönetilebilir.')
      return
    }

    if (!form.registration_id) {
      setFormError('Kayıt seçmelisiniz.')
      return
    }

    if (Number(form.remaining_amount) < 0) {
      setFormError('Kalan tutar negatif olamaz.')
      return
    }

    const result = await onSubmit(
      {
        first_due_date: form.first_due_date,
        installment_count: Number(form.installment_count || 1),
        notes: form.notes,
        paid_amount: Number(form.paid_amount || 0),
        payment_method: form.payment_method || undefined,
        payment_status: 'odenmedi',
        registration_id: form.registration_id,
        remaining_amount: Number(form.remaining_amount || 0),
        total_amount: Number(form.total_amount || 0),
      },
      editingPayment,
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
            <p className="text-sm font-medium text-emerald-700">Ödeme Planı</p>
            <h2 className="text-lg font-semibold text-neutral-950">
              {editingPayment ? 'Ödeme düzenle' : 'Yeni ödeme planı oluştur'}
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
                Kayıt seçimi
              </span>
              <select
                required
                disabled={Boolean(editingPayment)}
                value={form.registration_id}
                onChange={(event) =>
                  updateField('registration_id', event.target.value)
                }
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-neutral-50 disabled:text-neutral-500"
              >
                <option value="">Kayıt seçin</option>
                {references.registrations.map((registration) => (
                  <option key={registration.id} value={registration.id}>
                    {getRegistrationLabel(registration)}
                  </option>
                ))}
              </select>
            </label>

            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
              <p className="text-xs font-semibold uppercase text-neutral-500">
                Veli
              </p>
              <p className="mt-1 text-sm font-medium text-neutral-900">
                {selectedParent?.full_name ?? '-'}
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
              <p className="text-xs font-semibold uppercase text-neutral-500">
                Öğrenci
              </p>
              <p className="mt-1 text-sm font-medium text-neutral-900">
                {selectedStudent?.full_name ?? '-'}
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 md:col-span-2">
              <p className="text-xs font-semibold uppercase text-neutral-500">
                Program
              </p>
              <p className="mt-1 text-sm font-medium text-neutral-900">
                {selectedProgram?.name ?? '-'}
              </p>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Toplam tutar
              </span>
              <input
                min={0}
                type="number"
                value={form.total_amount}
                disabled={!isAdmin}
                onChange={(event) =>
                  updateField('total_amount', event.target.value)
                }
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-neutral-50 disabled:text-neutral-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Ödenen tutar
              </span>
              <input
                min={0}
                type="number"
                value={form.paid_amount}
                disabled={Boolean(editingPayment)}
                onChange={(event) =>
                  updateField('paid_amount', event.target.value)
                }
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-neutral-50 disabled:text-neutral-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Kalan tutar
              </span>
              <input
                readOnly
                value={form.remaining_amount}
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-600 outline-none"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Ödeme yöntemi
              </span>
              <select
                value={form.payment_method}
                onChange={(event) =>
                  updateField(
                    'payment_method',
                    event.target.value as PaymentMethod | '',
                  )
                }
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">Yöntem seçin</option>
                {paymentMethodOptions.map((method) => (
                  <option key={method} value={method}>
                    {paymentMethodLabels[method]}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Taksit sayısı
              </span>
              <input
                min={1}
                type="number"
                value={form.installment_count}
                onChange={(event) =>
                  updateField('installment_count', event.target.value)
                }
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                İlk ödeme tarihi
              </span>
              <input
                type="date"
                value={form.first_due_date}
                onChange={(event) =>
                  updateField('first_due_date', event.target.value)
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
              disabled={saving || !isAdmin}
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
