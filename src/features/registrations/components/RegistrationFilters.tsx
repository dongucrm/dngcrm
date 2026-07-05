import { RotateCcw, Search } from 'lucide-react'
import type { RegistrationStatus } from '../../../types/database'
import { registrationStatusLabels } from '../../../utils/labels'
import { registrationStatusOptions } from '../constants'
import type { RegistrationFiltersState, RegistrationReferences } from '../types'

type RegistrationFiltersProps = {
  filters: RegistrationFiltersState
  references: RegistrationReferences
  onChange: (filters: RegistrationFiltersState) => void
  onReset: () => void
}

export function RegistrationFilters({
  filters,
  onChange,
  onReset,
  references,
}: RegistrationFiltersProps) {
  function updateFilter<K extends keyof RegistrationFiltersState>(
    key: K,
    value: RegistrationFiltersState[K],
  ) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[minmax(180px,1fr)_160px_180px_140px_140px_auto]">
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
            updateFilter(
              'status',
              event.target.value as RegistrationStatus | 'all',
            )
          }
          className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="all">Tüm durumlar</option>
          {registrationStatusOptions.map((status) => (
            <option key={status} value={status}>
              {registrationStatusLabels[status]}
            </option>
          ))}
        </select>

        <select
          value={filters.programId}
          onChange={(event) => updateFilter('programId', event.target.value)}
          className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="all">Tüm programlar</option>
          {references.programs.map((program) => (
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
