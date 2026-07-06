import { Banknote } from 'lucide-react'
import type { PaymentInstallment } from '../../../types/database'
import { paymentInstallmentStatusLabels } from '../../../utils/labels'

type InstallmentsTableProps = {
  canCollect?: boolean
  installments: PaymentInstallment[]
  onCollect?: (installment: PaymentInstallment) => void
}

function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat('tr-TR', {
    currency: 'TRY',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(Number(value ?? 0))
}

export function InstallmentsTable({
  canCollect = false,
  installments,
  onCollect,
}: InstallmentsTableProps) {
  if (installments.length === 0) {
    return <p className="text-sm text-neutral-500">Taksit bulunmuyor.</p>
  }

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200">
      <table className="min-w-full divide-y divide-neutral-200 text-sm">
        <thead className="bg-neutral-50 text-left text-xs font-semibold uppercase text-neutral-500">
          <tr>
            <th className="px-4 py-3">Taksit</th>
            <th className="px-4 py-3">Tutar</th>
            <th className="px-4 py-3">Ödenen</th>
            <th className="px-4 py-3">Kalan</th>
            <th className="px-4 py-3">Vade</th>
            <th className="px-4 py-3">Durum</th>
            {canCollect ? <th className="px-4 py-3 text-right">İşlem</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 bg-white">
          {installments.map((installment) => (
            <tr key={installment.id}>
              <td className="px-4 py-3 font-semibold text-neutral-950">
                {installment.installment_no ?? '-'}
              </td>
              <td className="px-4 py-3">{formatCurrency(installment.amount)}</td>
              <td className="px-4 py-3">
                {formatCurrency(installment.paid_amount)}
              </td>
              <td className="px-4 py-3">
                {formatCurrency(installment.remaining_amount)}
              </td>
              <td className="px-4 py-3">{installment.due_date ?? '-'}</td>
              <td className="px-4 py-3">
                <span className="rounded-lg bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-700">
                  {installment.status
                    ? paymentInstallmentStatusLabels[installment.status]
                    : '-'}
                </span>
              </td>
              {canCollect ? (
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    disabled={
                      installment.status === 'odendi' ||
                      installment.status === 'iptal' ||
                      Number(installment.remaining_amount ?? 0) <= 0
                    }
                    onClick={() => onCollect?.(installment)}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Banknote className="h-4 w-4" aria-hidden="true" />
                    Tahsilat
                  </button>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
