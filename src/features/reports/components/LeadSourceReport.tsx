import type { LeadSourceReportRow } from '../types'
import { ReportTable, type ReportColumn } from './ReportTable'

type LeadSourceReportProps = {
  canExport: boolean
  rows: LeadSourceReportRow[]
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

const columns: ReportColumn<LeadSourceReportRow>[] = [
  { header: 'Kaynak', render: (row) => row.source },
  { align: 'right', header: 'Lead', render: (row) => row.leadCount },
  { align: 'right', header: 'Kayit olan', render: (row) => row.registeredLeadCount },
  { align: 'right', header: 'Donusum', render: (row) => `${row.conversionRate}%` },
  {
    align: 'right',
    header: 'Tahmini gelir',
    render: (row) => formatCurrency(row.estimatedRevenue),
  },
  {
    align: 'right',
    header: 'Kesinlesen gelir',
    render: (row) => formatCurrency(row.confirmedRevenue),
  },
]

export function LeadSourceReport({
  canExport,
  onExportCsv,
  onExportExcel,
  rows,
}: LeadSourceReportProps) {
  return (
    <ReportTable
      canExport={canExport}
      columns={columns}
      description="Lead kaynaklarina gore kayit donusumu ve gelir tahmini."
      getRowKey={(row) => row.source}
      rows={rows}
      title="Lead Kaynak Raporu"
      onExportCsv={onExportCsv}
      onExportExcel={onExportExcel}
    />
  )
}
