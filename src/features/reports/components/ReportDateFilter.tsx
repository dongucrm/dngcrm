import { RefreshCw } from 'lucide-react'
import { paymentInstallmentStatusOptions, paymentStatusOptions } from '../../payments/constants'
import { programTypeOptions } from '../../programs/constants'
import { reportDatePresetOptions } from '../constants'
import type { ProgramReportRow, ReportFilters } from '../types'

type ReportDateFilterProps = {
  filters: ReportFilters
  loading: boolean
  programOptions: ProgramReportRow[]
  onChange: (filters: ReportFilters) => void
  onRefresh: () => void
}

export function ReportDateFilter({
  filters,
  loading,
  onChange,
  onRefresh,
  programOptions,
}: ReportDateFilterProps) {
  function update<K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) {
    onChange({
      ...filters,
      [key]: value,
    })
  }

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label>
          <span className="text-xs font-semibold uppercase text-neutral-500">
            Tarih
          </span>
          <select
            value={filters.preset}
            onChange={(event) =>
              update('preset', event.target.value as ReportFilters['preset'])
            }
            className="mt-1 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            {reportDatePresetOptions.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="text-xs font-semibold uppercase text-neutral-500">
            Baslangic
          </span>
          <input
            type="date"
            value={filters.start}
            onChange={(event) => update('start', event.target.value)}
            disabled={filters.preset !== 'custom'}
            className="mt-1 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-neutral-50"
          />
        </label>

        <label>
          <span className="text-xs font-semibold uppercase text-neutral-500">
            Bitis
          </span>
          <input
            type="date"
            value={filters.end}
            onChange={(event) => update('end', event.target.value)}
            disabled={filters.preset !== 'custom'}
            className="mt-1 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-neutral-50"
          />
        </label>

        <label>
          <span className="text-xs font-semibold uppercase text-neutral-500">
            Program
          </span>
          <select
            value={filters.programId}
            onChange={(event) => update('programId', event.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">Tum programlar</option>
            {programOptions.map((program) => (
              <option key={program.programId} value={program.programId}>
                {program.programName}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="text-xs font-semibold uppercase text-neutral-500">
            Program turu
          </span>
          <select
            value={filters.programType}
            onChange={(event) =>
              update('programType', event.target.value as ReportFilters['programType'])
            }
            className="mt-1 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">Tum turler</option>
            {programTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="text-xs font-semibold uppercase text-neutral-500">
            Program durumu
          </span>
          <select
            value={filters.programActive}
            onChange={(event) =>
              update('programActive', event.target.value as ReportFilters['programActive'])
            }
            className="mt-1 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">Tum durumlar</option>
            <option value="active">Aktif</option>
            <option value="passive">Pasif</option>
          </select>
        </label>

        <label>
          <span className="text-xs font-semibold uppercase text-neutral-500">
            Odeme durumu
          </span>
          <select
            value={filters.paymentStatus}
            onChange={(event) =>
              update('paymentStatus', event.target.value as ReportFilters['paymentStatus'])
            }
            className="mt-1 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">Tum odemeler</option>
            {paymentStatusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="text-xs font-semibold uppercase text-neutral-500">
            Taksit durumu
          </span>
          <select
            value={filters.installmentStatus}
            onChange={(event) =>
              update(
                'installmentStatus',
                event.target.value as ReportFilters['installmentStatus'],
              )
            }
            className="mt-1 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">Tum taksitler</option>
            {paymentInstallmentStatusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700">
            <input
              type="checkbox"
              checked={filters.onlyOverdue}
              onChange={(event) => update('onlyOverdue', event.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-emerald-600"
            />
            Sadece gecikenler
          </label>
          <label className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700">
            <input
              type="checkbox"
              checked={filters.onlyDueToday}
              onChange={(event) => update('onlyDueToday', event.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-emerald-600"
            />
            Bugun vadesi olanlar
          </label>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 px-4 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Yenile
        </button>
      </div>
    </section>
  )
}
