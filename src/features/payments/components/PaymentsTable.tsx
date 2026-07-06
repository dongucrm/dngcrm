import {
  Banknote,
  Eye,
  ListChecks,
  ListOrdered,
  MessageCircle,
  UserPen,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { paymentStatusLabels } from '../../../utils/labels'
import { getWhatsAppUrl } from '../../../utils/phone'
import {
  getPaymentParentRecord,
  getPaymentProgram,
  getPaymentStudent,
} from '../services/paymentService'
import type { PaymentRecord } from '../types'

type PaymentsTableProps = {
  canManage: boolean
  payments: PaymentRecord[]
  onCollect: (payment: PaymentRecord) => void
  onCreateTask: (payment: PaymentRecord) => void
  onEdit: (payment: PaymentRecord) => void
  onShowInstallments: (payment: PaymentRecord) => void
  onWhatsApp: (payment: PaymentRecord) => string | null
}

function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat('tr-TR', {
    currency: 'TRY',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(Number(value ?? 0))
}

export function PaymentsTable({
  canManage,
  onCollect,
  onCreateTask,
  onEdit,
  onShowInstallments,
  onWhatsApp,
  payments,
}: PaymentsTableProps) {
  return (
    <div className="hidden overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm xl:block">
      <table className="min-w-full divide-y divide-neutral-200 text-sm">
        <thead className="bg-neutral-50 text-left text-xs font-semibold uppercase text-neutral-500">
          <tr>
            <th className="px-4 py-3">Veli</th>
            <th className="px-4 py-3">Öğrenci</th>
            <th className="px-4 py-3">Program</th>
            <th className="px-4 py-3">Toplam</th>
            <th className="px-4 py-3">Ödenen</th>
            <th className="px-4 py-3">Kalan</th>
            <th className="px-4 py-3">Taksit</th>
            <th className="px-4 py-3">Yakın vade</th>
            <th className="px-4 py-3">Durum</th>
            <th className="px-4 py-3 text-right">İşlemler</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {payments.map((payment) => {
            const parent = getPaymentParentRecord(payment)
            const student = getPaymentStudent(payment)
            const program = getPaymentProgram(payment)
            const whatsappUrl = onWhatsApp(payment) ?? getWhatsAppUrl(parent?.phone ?? '')

            return (
              <tr key={payment.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <p className="font-semibold text-neutral-950">
                    {parent?.full_name ?? '-'}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {parent?.phone ?? '-'}
                  </p>
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {student?.full_name ?? '-'}
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {program?.name ?? '-'}
                </td>
                <td className="px-4 py-3 font-medium text-neutral-900">
                  {formatCurrency(payment.total_amount)}
                </td>
                <td className="px-4 py-3">
                  {formatCurrency(payment.paid_amount)}
                </td>
                <td className="px-4 py-3">
                  {formatCurrency(payment.remaining_amount)}
                </td>
                <td className="px-4 py-3">
                  {payment.paid_installment_count}/{payment.installment_count ?? 0}
                </td>
                <td className="px-4 py-3">{payment.nearest_due_date ?? '-'}</td>
                <td className="px-4 py-3">
                  <span className="rounded-lg bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-700">
                    {payment.payment_status
                      ? paymentStatusLabels[payment.payment_status]
                      : '-'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      to={`/payments/${payment.id}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 hover:bg-white"
                      aria-label="Detay"
                    >
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <button
                      type="button"
                      disabled={!canManage}
                      onClick={() => onEdit(payment)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 hover:bg-white disabled:opacity-40"
                      aria-label="Düzenle"
                    >
                      <UserPen className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      disabled={!canManage}
                      onClick={() => onCollect(payment)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 hover:bg-white disabled:opacity-40"
                      aria-label="Tahsilat"
                    >
                      <Banknote className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onShowInstallments(payment)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 hover:bg-white"
                      aria-label="Taksitler"
                    >
                      <ListOrdered className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <a
                      href={whatsappUrl ?? undefined}
                      target="_blank"
                      rel="noreferrer"
                      aria-disabled={!whatsappUrl}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 text-emerald-700 hover:bg-white aria-disabled:pointer-events-none aria-disabled:opacity-50"
                      aria-label="WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    </a>
                    <button
                      type="button"
                      onClick={() => onCreateTask(payment)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 hover:bg-white"
                      aria-label="Görev"
                    >
                      <ListChecks className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
