import { RotateCcw, Search } from 'lucide-react'
import type { PaymentMethod, PaymentStatus } from '../../../types/database'
import { paymentMethodLabels, paymentStatusLabels } from '../../../utils/labels'
import { paymentMethodOptions, paymentStatusOptions } from '../constants'
import type { PaymentFiltersState, PaymentReferences } from '../types'

type PaymentFiltersProps = {
  filters: PaymentFiltersState
  references: PaymentReferences
  onChange: (filters: PaymentFiltersState) => void
  onReset: () => void
}

export function PaymentFilters({
  filters,
  onChange,
  onReset,
  references,
}: PaymentFiltersProps) {
  function updateFilter<K extends keyof PaymentFiltersState>(
    key: K,
    value: PaymentFiltersState[K],
  ) {
    onChange({ ...filters, [key]: value })
  }

  const programs = Array.from(
    new Map(
      references.registrations
        .map((registration) => {
          const program = Array.isArray(registration.program)
            ? registration.program[0]
            : registration.program

          return program ? [program.id, program] : null
        })
        .filter(Boolean) as [string, { id: string; name: string }][],
    ).values(),
  )

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 xl:grid-cols-[minmax(200px,1fr)_150px_150px_180px_140px_140px_150px_auto]">
        <label className="relative block">
          <span className="sr-only">Ara</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            aria-hidden="true"
          />
          <input
            value={filters.search}
            onChange={(event) => updateFilter('search', event.target.value)}
            placeholder="Veli, öğrenci veya program ara"
            className="h-10 w-full rounded-lg border border-neutral-200 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </label>

        <select
          value={filters.status}
          onChange={(event) =>
            updateFilter('status', event.target.value as PaymentStatus | 'all')
          }
          className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="all">Tüm durumlar</option>
          {paymentStatusOptions.map((status) => (
            <option key={status} value={status}>
              {paymentStatusLabels[status]}
            </option>
          ))}
        </select>

        <select
          value={filters.method}
          onChange={(event) =>
            updateFilter('method', event.target.value as PaymentMethod | 'all')
          }
          className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="all">Tüm yöntemler</option>
          {paymentMethodOptions.map((method) => (
            <option key={method} value={method}>
              {paymentMethodLabels[method]}
            </option>
          ))}
        </select>

        <select
          value={filters.programId}
          onChange={(event) => updateFilter('programId', event.target.value)}
          className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="all">Tüm programlar</option>
          {programs.map((program) => (
            <option key={program.id} value={program.id}>
              {program.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filters.dateFrom}
          onChange={(event) => updateFilter('dateFrom', event.target.value)}
          className="h-10 rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />

        <input
          type="date"
          value={filters.dateTo}
          onChange={(event) => updateFilter('dateTo', event.target.value)}
          className="h-10 rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />

        <select
          value={filters.preset}
          onChange={(event) =>
            updateFilter(
              'preset',
              event.target.value as PaymentFiltersState['preset'],
            )
          }
          className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="all">Tüm ödemeler</option>
          <option value="today">Bugün ödemesi olanlar</option>
          <option value="overdue">Geciken ödemeler</option>
        </select>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Sıfırla
        </button>
      </div>
    </section>
  )
}
