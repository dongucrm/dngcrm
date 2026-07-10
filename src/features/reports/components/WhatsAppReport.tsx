import { formatNullableDateTime } from '../../../utils/date'
import type { WhatsAppReportRow, WhatsAppReportSummary } from '../types'
import { ReportTable, type ReportColumn } from './ReportTable'

type WhatsAppReportProps = {
  canExport: boolean
  rows: WhatsAppReportRow[]
  summary: WhatsAppReportSummary
  onExportCsv: () => void
  onExportExcel: () => void
}

const columns: ReportColumn<WhatsAppReportRow>[] = [
  { header: 'Tarih', render: (row) => formatNullableDateTime(row.openedAt) },
  { header: 'Sablon', render: (row) => row.templateTitle },
  { header: 'Entity type', render: (row) => row.entityType },
  { header: 'Telefon', render: (row) => row.phone },
  { header: 'Kullanici', render: (row) => row.userName },
  { header: 'Mesaj onizleme', render: (row) => row.messagePreview || '-' },
]

export function WhatsAppReport({
  canExport,
  onExportCsv,
  onExportExcel,
  rows,
  summary,
}: WhatsAppReportProps) {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
        Bu rapor mesaj gonderildi anlamina gelmez; yalnizca WhatsApp ekraninin
        acildigini ifade eder.
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Toplam acma', summary.totalCount],
          ['Bugunku acma', summary.todayCount],
          ['En cok sablon', summary.topTemplate],
          ['En aktif personel', summary.mostActiveUser],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase text-neutral-500">
              {label}
            </p>
            <p className="mt-2 text-lg font-semibold text-neutral-950">
              {value}
            </p>
          </div>
        ))}
      </div>
      <ReportTable
        canExport={canExport}
        columns={columns}
        description="WhatsApp ekran acma loglari ve sablon kullanimlari."
        getRowKey={(row) => row.whatsAppLogId}
        rows={rows}
        title="WhatsApp Raporu"
        onExportCsv={onExportCsv}
        onExportExcel={onExportExcel}
      />
    </div>
  )
}
