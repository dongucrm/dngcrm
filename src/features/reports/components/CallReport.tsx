import { formatNullableDateTime } from '../../../utils/date'
import { callStatusLabels } from '../../../utils/labels'
import type { CallReportRow, CallReportSummary } from '../types'
import { ReportTable, type ReportColumn } from './ReportTable'

type CallReportProps = {
  canExport: boolean
  rows: CallReportRow[]
  summary: CallReportSummary
  onExportCsv: () => void
  onExportExcel: () => void
}

const columns: ReportColumn<CallReportRow>[] = [
  { header: 'Tarih', render: (row) => formatNullableDateTime(row.callDate) },
  { header: 'Lead / veli', render: (row) => row.personName },
  { header: 'Telefon', render: (row) => row.phone },
  { header: 'Personel', render: (row) => row.userName },
  {
    header: 'Durum',
    render: (row) => (row.status ? callStatusLabels[row.status] ?? row.status : '-'),
  },
  { header: 'Sonraki arama', render: (row) => formatNullableDateTime(row.nextCallDate) },
  { header: 'Not', render: (row) => row.notes || '-' },
]

export function CallReport({
  canExport,
  onExportCsv,
  onExportExcel,
  rows,
  summary,
}: CallReportProps) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ['Toplam arama', summary.totalCount],
          ['Ulasilamayan', summary.unreachableCount],
          ['Bilgi verilen', summary.infoGivenCount],
          ['Tekrar aranacak', summary.repeatCount],
          ['Kayit olan', summary.registeredCount],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase text-neutral-500">
              {label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-neutral-950">
              {value}
            </p>
          </div>
        ))}
      </div>
      <ReportTable
        canExport={canExport}
        columns={columns}
        description="Gorusme kayitlari ve arama performansi."
        getRowKey={(row) => row.callId}
        rows={rows}
        title="Arama Raporu"
        onExportCsv={onExportCsv}
        onExportExcel={onExportExcel}
      />
    </div>
  )
}
