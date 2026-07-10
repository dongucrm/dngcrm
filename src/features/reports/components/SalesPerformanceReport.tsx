import type { SalesPerformanceReportRow } from '../types'
import { ReportTable, type ReportColumn } from './ReportTable'

type SalesPerformanceReportProps = {
  canExport: boolean
  rows: SalesPerformanceReportRow[]
  onExportCsv: () => void
  onExportExcel: () => void
}

const columns: ReportColumn<SalesPerformanceReportRow>[] = [
  { header: 'Personel', render: (row) => row.profileName },
  { align: 'right', header: 'Atanan lead', render: (row) => row.assignedLeadCount },
  { align: 'right', header: 'Aranan lead', render: (row) => row.calledLeadCount },
  {
    align: 'right',
    header: 'Ulasilamayan',
    render: (row) => row.unreachableCount,
  },
  { align: 'right', header: 'Bilgi verilen', render: (row) => row.infoGivenCount },
  { align: 'right', header: 'Kayit olan', render: (row) => row.registeredLeadCount },
  { align: 'right', header: 'Donusum', render: (row) => `${row.conversionRate}%` },
  { align: 'right', header: 'Gorev', render: (row) => row.taskCount },
  { align: 'right', header: 'Tamamlanan', render: (row) => row.completedTaskCount },
  { align: 'right', header: 'WhatsApp', render: (row) => row.whatsAppOpenCount },
]

export function SalesPerformanceReport({
  canExport,
  onExportCsv,
  onExportExcel,
  rows,
}: SalesPerformanceReportProps) {
  return (
    <ReportTable
      canExport={canExport}
      columns={columns}
      description="Personel bazinda lead, arama, gorev ve WhatsApp performansi."
      getRowKey={(row) => row.profileId}
      rows={rows}
      title="Satis Personeli Performansi"
      onExportCsv={onExportCsv}
      onExportExcel={onExportExcel}
    />
  )
}
