import { formatNullableDateTime } from '../../../utils/date'
import { leadPriorityLabels, taskStatusLabels } from '../../../utils/labels'
import type { TaskReportRow, TaskReportSummary } from '../types'
import { ReportTable, type ReportColumn } from './ReportTable'

type TaskReportProps = {
  canExport: boolean
  rows: TaskReportRow[]
  summary: TaskReportSummary
  onExportCsv: () => void
  onExportExcel: () => void
}

const columns: ReportColumn<TaskReportRow>[] = [
  { header: 'Gorev basligi', render: (row) => row.title },
  { header: 'Atanan personel', render: (row) => row.assignedUserName },
  { header: 'Ilgili kisi', render: (row) => row.personName },
  { header: 'Son tarih', render: (row) => formatNullableDateTime(row.dueDate) },
  {
    header: 'Oncelik',
    render: (row) => (row.priority ? leadPriorityLabels[row.priority] ?? row.priority : '-'),
  },
  {
    header: 'Durum',
    render: (row) => (row.status ? taskStatusLabels[row.status] ?? row.status : '-'),
  },
]

export function TaskReport({
  canExport,
  onExportCsv,
  onExportExcel,
  rows,
  summary,
}: TaskReportProps) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ['Toplam gorev', summary.totalCount],
          ['Bekleyen', summary.pendingCount],
          ['Tamamlanan', summary.completedCount],
          ['Geciken', summary.overdueCount],
          ['Iptal', summary.cancelledCount],
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
        description="Gorevlerin personel, oncelik ve durum dagilimi."
        getRowKey={(row) => row.taskId}
        rows={rows}
        title="Gorev Raporu"
        onExportCsv={onExportCsv}
        onExportExcel={onExportExcel}
      />
    </div>
  )
}
