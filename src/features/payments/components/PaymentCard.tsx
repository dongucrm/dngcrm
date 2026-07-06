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

type PaymentCardProps = {
  canManage: boolean
  payment: PaymentRecord
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

export function PaymentCard({
  canManage,
  onCollect,
  onCreateTask,
  onEdit,
  onShowInstallments,
  onWhatsApp,
  payment,
}: PaymentCardProps) {
  const parent = getPaymentParentRecord(payment)
  const student = getPaymentStudent(payment)
  const program = getPaymentProgram(payment)
  const whatsappUrl = onWhatsApp(payment) ?? getWhatsAppUrl(parent?.phone ?? '')

  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-neutral-950">
            {parent?.full_name ?? '-'}
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            {student?.full_name ?? '-'} · {program?.name ?? '-'}
          </p>
        </div>
        <span className="rounded-lg bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-700">
          {payment.payment_status
            ? paymentStatusLabels[payment.payment_status]
            : '-'}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <div className="rounded-lg bg-neutral-50 p-3">
          <p className="text-xs text-neutral-500">Toplam</p>
          <p className="mt-1 font-semibold text-neutral-950">
            {formatCurrency(payment.total_amount)}
          </p>
        </div>
        <div className="rounded-lg bg-neutral-50 p-3">
          <p className="text-xs text-neutral-500">Ödenen</p>
          <p className="mt-1 font-semibold text-neutral-950">
            {formatCurrency(payment.paid_amount)}
          </p>
        </div>
        <div className="rounded-lg bg-neutral-50 p-3">
          <p className="text-xs text-neutral-500">Kalan</p>
          <p className="mt-1 font-semibold text-neutral-950">
            {formatCurrency(payment.remaining_amount)}
          </p>
        </div>
      </div>

      <p className="mt-3 text-sm text-neutral-500">
        Yakın vade: {payment.nearest_due_date ?? '-'} · Taksit:{' '}
        {payment.paid_installment_count}/{payment.installment_count ?? 0}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to={`/payments/${payment.id}`}
          className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-200 text-sm font-semibold text-neutral-700"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
          Detay
        </Link>
        <button
          type="button"
          disabled={!canManage}
          onClick={() => onEdit(payment)}
          className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-200 text-sm font-semibold text-neutral-700 disabled:opacity-40"
        >
          <UserPen className="h-4 w-4" aria-hidden="true" />
          Düzenle
        </button>
        <button
          type="button"
          disabled={!canManage}
          onClick={() => onCollect(payment)}
          className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-200 text-sm font-semibold text-neutral-700 disabled:opacity-40"
        >
          <Banknote className="h-4 w-4" aria-hidden="true" />
          Tahsilat
        </button>
        <button
          type="button"
          onClick={() => onShowInstallments(payment)}
          className="inline-flex h-9 w-10 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700"
          aria-label="Taksitler"
        >
          <ListOrdered className="h-4 w-4" aria-hidden="true" />
        </button>
        <a
          href={whatsappUrl ?? undefined}
          target="_blank"
          rel="noreferrer"
          aria-disabled={!whatsappUrl}
          className="inline-flex h-9 w-10 items-center justify-center rounded-lg border border-emerald-200 text-emerald-700 aria-disabled:pointer-events-none aria-disabled:opacity-50"
          aria-label="WhatsApp"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
        </a>
        <button
          type="button"
          onClick={() => onCreateTask(payment)}
          className="inline-flex h-9 w-10 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700"
          aria-label="Görev"
        >
          <ListChecks className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}
