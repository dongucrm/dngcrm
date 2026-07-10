import { programTypeLabels } from '../../../utils/labels'
import type { ProgramReportRow } from '../types'
import { ReportTable, type ReportColumn } from './ReportTable'

type ProgramReportProps = {
  canExport: boolean
  rows: ProgramReportRow[]
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

const columns: ReportColumn<ProgramReportRow>[] = [
  { header: 'Program adi', render: (row) => row.programName },
  {
    header: 'Tur',
    render: (row) =>
      programTypeLabels[row.programType as keyof typeof programTypeLabels] ??
      row.programType,
  },
  { align: 'right', header: 'Kontenjan', render: (row) => row.quota ?? '-' },
  { align: 'right', header: 'Lead', render: (row) => row.leadCount },
  { align: 'right', header: 'On kayit', render: (row) => row.preRegistrations },
  {
    align: 'right',
    header: 'Kesin kayit',
    render: (row) => row.confirmedRegistrations,
  },
  { align: 'right', header: 'Iptal', render: (row) => row.cancelledRegistrations },
  { align: 'right', header: 'Doluluk', render: (row) => `${row.fillRate}%` },
  {
    align: 'right',
    header: 'Beklenen gelir',
    render: (row) => formatCurrency(row.expectedRevenue),
  },
  {
    align: 'right',
    header: 'Tahsil edilen',
    render: (row) => formatCurrency(row.collectedAmount),
  },
  {
    align: 'right',
    header: 'Kalan odeme',
    render: (row) => formatCurrency(row.remainingAmount),
  },
]

export function ProgramReport({
  canExport,
  onExportCsv,
  onExportExcel,
  rows,
}: ProgramReportProps) {
  return (
    <ReportTable
      canExport={canExport}
      columns={columns}
      description="Programlara gore lead, kayit, doluluk ve gelir ozeti."
      getRowKey={(row) => row.programId}
      rows={rows}
      title="Program Bazli Rapor"
      onExportCsv={onExportCsv}
      onExportExcel={onExportExcel}
    />
  )
}
