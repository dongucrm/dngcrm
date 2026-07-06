import { X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import type { PaymentInstallment } from '../../../types/database'
import type { CollectPaymentValues, PaymentRecord } from '../types'

type CollectPaymentModalProps = {
  installment: PaymentInstallment | null
  isOpen: boolean
  payment: PaymentRecord | null
  saving: boolean
  onClose: () => void
  onSubmit: (
    payment: PaymentRecord,
    values: CollectPaymentValues,
  ) => Promise<{ data?: PaymentRecord; error?: string }>
}

const today = new Date().toISOString().slice(0, 10)

export function CollectPaymentModal({
  installment,
  isOpen,
  onClose,
  onSubmit,
  payment,
  saving,
}: CollectPaymentModalProps) {
  const [amount, setAmount] = useState('')
  const [paidDate, setPaidDate] = useState(today)
  const [notes, setNotes] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && installment) {
      setAmount(String(installment.remaining_amount ?? 0))
      setPaidDate(today)
      setNotes('')
      setFormError(null)
    }
  }, [installment, isOpen])

  if (!isOpen || !installment || !payment) {
    return null
  }

  const activeInstallment: PaymentInstallment = installment
  const activePayment: PaymentRecord = payment

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (Number(amount) <= 0) {
      setFormError('Tahsilat tutarı sıfırdan büyük olmalıdır.')
      return
    }

    const result = await onSubmit(activePayment, {
      amount: Number(amount),
      installment_id: activeInstallment.id,
      notes,
      paid_date: paidDate,
    })

    if (result.error) {
      setFormError(result.error)
      return
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-neutral-950/40 px-4 py-6">
      <section className="w-full max-w-lg rounded-lg border border-neutral-200 bg-white shadow-lg">
        <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-5 py-4">
          <div>
            <p className="text-sm font-medium text-emerald-700">Tahsilat</p>
            <h2 className="text-lg font-semibold text-neutral-950">
              Taksit tahsilatı gir
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
          <div className="space-y-4 px-5 py-5">
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm">
              <p className="font-semibold text-neutral-950">
                {installment.installment_no}. taksit
              </p>
              <p className="mt-1 text-neutral-600">
                Kalan tutar: {Number(installment.remaining_amount ?? 0)}
              </p>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Ödenen tutar
              </span>
              <input
                required
                min={0}
                type="number"
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value)
                  setFormError(null)
                }}
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Ödeme tarihi
              </span>
              <input
                type="date"
                value={paidDate}
                onChange={(event) => setPaidDate(event.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">Notlar</span>
              <textarea
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>

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
              {saving ? 'Kaydediliyor...' : 'Tahsilatı Kaydet'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
