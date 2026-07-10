import { formatDate } from '../../../utils/date'
import { paymentInstallmentStatusLabels } from '../../../utils/labels'
import type { InstallmentReportRow } from '../types'
import { ReportTable, type ReportColumn } from './ReportTable'

type InstallmentReportProps = {
  canExport: boolean
  rows: InstallmentReportRow[]
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

const columns: ReportColumn<InstallmentReportRow>[] = [
  { header: 'Veli', render: (row) => row.parentName },
  { header: 'Ogrenci', render: (row) => row.studentName },
  { header: 'Program', render: (row) => row.programName },
  { align: 'right', header: 'Taksit no', render: (row) => row.installmentNo ?? '-' },
  { align: 'right', header: 'Tutar', render: (row) => formatCurrency(row.amount) },
  { align: 'right', header: 'Odenen', render: (row) => formatCurrency(row.paidAmount) },
  { align: 'right', header: 'Kalan', render: (row) => formatCurrency(row.remainingAmount) },
  { header: 'Vade', render: (row) => formatDate(row.dueDate) },
  {
    header: 'Durum',
    render: (row) =>
      row.status ? paymentInstallmentStatusLabels[row.status] ?? row.status : '-',
  },
]

export function InstallmentReport({
  canExport,
  onExportCsv,
  onExportExcel,
  rows,
}: InstallmentReportProps) {
  return (
    <ReportTable
      canExport={canExport}
      columns={columns}
      description="Taksit bazinda vade, kalan tutar ve tahsilat durumu."
      getRowKey={(row) => row.installmentId}
      rows={rows}
      title="Taksit Raporu"
      onExportCsv={onExportCsv}
      onExportExcel={onExportExcel}
    />
  )
}
