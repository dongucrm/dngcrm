import { RotateCcw, Search } from 'lucide-react'
import type {
  LeadPriority,
  LeadProbability,
  LeadStatus,
  Program,
} from '../../types/database'
import {
  leadPriorityOptions,
  leadProbabilityOptions,
  leadStatusOptions,
} from './constants'
import type { LeadFilters } from './types'
import {
  leadPriorityLabels,
  leadProbabilityLabels,
  leadStatusLabels,
} from '../../utils/labels'

type LeadFiltersBarProps = {
  filters: LeadFilters
  programs: Program[]
  sourceOptions: string[]
  onChange: (filters: LeadFilters) => void
  onReset: () => void
}

function formatSourceLabel(source: string) {
  return source
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function LeadFiltersBar({
  filters,
  onChange,
  onReset,
  programs,
  sourceOptions,
}: LeadFiltersBarProps) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="relative md:col-span-2 xl:col-span-1">
          <span className="sr-only">Lead ara</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={filters.search}
            onChange={(event) =>
              onChange({ ...filters, search: event.target.value })
            }
            placeholder="Veli, telefon, email veya not ara"
            className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm text-neutral-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </label>

        <select
          value={filters.status}
          onChange={(event) =>
            onChange({
              ...filters,
              status: event.target.value as LeadStatus | 'all',
            })
          }
          className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          aria-label="Duruma göre filtrele"
        >
          <option value="all">Tüm durumlar</option>
          {leadStatusOptions.map((status) => (
            <option key={status} value={status}>
              {leadStatusLabels[status]}
            </option>
          ))}
        </select>

        <select
          value={filters.programId}
          onChange={(event) =>
            onChange({ ...filters, programId: event.target.value })
          }
          className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          aria-label="Programa göre filtrele"
        >
          <option value="all">Tüm programlar</option>
          {programs.map((program) => (
            <option key={program.id} value={program.id}>
              {program.name}
            </option>
          ))}
        </select>

        <select
          value={filters.source}
          onChange={(event) =>
            onChange({ ...filters, source: event.target.value })
          }
          className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          aria-label="Kaynağa göre filtrele"
        >
          <option value="all">Tüm kaynaklar</option>
          {sourceOptions.map((source) => (
            <option key={source} value={source}>
              {formatSourceLabel(source)}
            </option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(event) =>
            onChange({
              ...filters,
              priority: event.target.value as LeadPriority | 'all',
            })
          }
          className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          aria-label="Önceliğe göre filtrele"
        >
          <option value="all">Tüm öncelikler</option>
          {leadPriorityOptions.map((priority) => (
            <option key={priority} value={priority}>
              {leadPriorityLabels[priority]}
            </option>
          ))}
        </select>

        <select
          value={filters.probability}
          onChange={(event) =>
            onChange({
              ...filters,
              probability: event.target.value as LeadProbability | 'all',
            })
          }
          className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          aria-label="Kayıt ihtimaline göre filtrele"
        >
          <option value="all">Tüm ihtimaller</option>
          {leadProbabilityOptions.map((probability) => (
            <option key={probability} value={probability}>
              {leadProbabilityLabels[probability]}
            </option>
          ))}
        </select>

        <select
          value={filters.callFilter}
          onChange={(event) =>
            onChange({
              ...filters,
              callFilter: event.target.value as LeadFilters['callFilter'],
            })
          }
          className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          aria-label="Arama tarihine göre filtrele"
        >
          <option value="all">Tüm aramalar</option>
          <option value="today">Bugün aranacaklar</option>
          <option value="overdue">Geciken aramalar</option>
        </select>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Sıfırla
        </button>
      </div>
    </section>
  )
}
