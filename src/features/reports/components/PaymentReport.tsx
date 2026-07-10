import { formatDate } from '../../../utils/date'
import { paymentStatusLabels } from '../../../utils/labels'
import type { PaymentReportRow } from '../types'
import { ReportTable, type ReportColumn } from './ReportTable'

type PaymentReportProps = {
  canExport: boolean
  rows: PaymentReportRow[]
  onExportCsv: () => void
  onExportExcel: () => void
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    currency: 'TRY',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value)
}

const columns: ReportColumn<PaymentReportRow>[] = [
  { header: 'Veli', render: (row) => row.parentName },
  { header: 'Ogrenci', render: (row) => row.studentName },
  { header: 'Program', render: (row) => row.programName },
  { align: 'right', header: 'Toplam', render: (row) => formatCurrency(row.totalAmount) },
  { align: 'right', header: 'Odenen', render: (row) => formatCurrency(row.paidAmount) },
  { align: 'right', header: 'Kalan', render: (row) => formatCurrency(row.remainingAmount) },
  {
    align: 'right',
    header: 'Geciken',
    render: (row) => formatCurrency(row.overdueAmount),
  },
  {
    header: 'Durum',
    render: (row) =>
      row.status ? paymentStatusLabels[row.status] ?? row.status : '-',
  },
  { header: 'En yakin vade', render: (row) => formatDate(row.dueDate) },
]

export function PaymentReport({
  canExport,
  onExportCsv,
  onExportExcel,
  rows,
}: PaymentReportProps) {
  return (
    <ReportTable
      canExport={canExport}
      columns={columns}
      description="Odeme planlari, kalan tutarlar ve geciken odeme takibi."
      getRowKey={(row) => row.paymentId}
      rows={rows}
      title="Odeme Raporu"
      onExportCsv={onExportCsv}
      onExportExcel={onExportExcel}
    />
  )
}
