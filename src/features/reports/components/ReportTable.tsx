import { Download } from 'lucide-react'
import type { ReactNode } from 'react'

export type ReportColumn<T> = {
  align?: 'left' | 'right'
  header: string
  render: (row: T) => ReactNode
}

type ReportTableProps<T> = {
  canExport: boolean
  columns: ReportColumn<T>[]
  description?: string
  emptyText?: string
  getRowKey: (row: T) => string
  onExportCsv?: () => void
  onExportExcel?: () => void
  rows: T[]
  title: string
}

export function ReportTable<T>({
  canExport,
  columns,
  description,
  emptyText = 'Gosterilecek veri yok.',
  getRowKey,
  onExportCsv,
  onExportExcel,
  rows,
  title,
}: ReportTableProps<T>) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-neutral-200 p-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-950">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-neutral-500">{description}</p>
          ) : null}
        </div>

        {canExport ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={rows.length === 0}
              onClick={onExportCsv}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-neutral-200 px-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              CSV indir
            </button>
            <button
              type="button"
              disabled={rows.length === 0}
              onClick={onExportExcel}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-neutral-200 px-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Excel indir
            </button>
          </div>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <div className="p-6 text-sm font-medium text-neutral-500">
          {emptyText}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 text-sm">
            <thead className="bg-neutral-50 text-xs font-semibold uppercase text-neutral-500">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.header}
                    className={`px-4 py-3 ${
                      column.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {rows.map((row) => (
                <tr key={getRowKey(row)} className="hover:bg-neutral-50">
                  {columns.map((column) => (
                    <td
                      key={column.header}
                      className={`px-4 py-3 align-top text-neutral-700 ${
                        column.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
