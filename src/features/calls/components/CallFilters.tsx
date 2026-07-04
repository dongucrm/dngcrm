import { RotateCcw } from 'lucide-react'
import type {
  CallStatus,
  LeadPriority,
  LeadProbability,
  Program,
} from '../../../types/database'
import {
  callStatusLabels,
  leadPriorityLabels,
  leadProbabilityLabels,
} from '../../../utils/labels'
import {
  callPresetOptions,
  callStatusOptions,
  emptyCallFilters,
  leadPriorityOptions,
  leadProbabilityOptions,
} from '../constants'
import type { CallFilterPreset, CallFiltersState, CallProfile } from '../types'

type CallFiltersProps = {
  filters: CallFiltersState
  isAdmin: boolean
  profiles: CallProfile[]
  programs: Program[]
  sources: string[]
  onChange: (filters: CallFiltersState) => void
}

function formatSourceLabel(source: string) {
  return source
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function CallFilters({
  filters,
  isAdmin,
  onChange,
  profiles,
  programs,
  sources,
}: CallFiltersProps) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <select
          value={filters.preset}
          onChange={(event) =>
            onChange({
              ...filters,
              preset: event.target.value as CallFilterPreset,
            })
          }
          className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          aria-label="Hızlı arama filtresi"
        >
          {callPresetOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filters.dateFrom}
          onChange={(event) =>
            onChange({ ...filters, dateFrom: event.target.value })
          }
          className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          aria-label="Başlangıç tarihi"
        />

        <input
          type="date"
          value={filters.dateTo}
          onChange={(event) =>
            onChange({ ...filters, dateTo: event.target.value })
          }
          className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          aria-label="Bitiş tarihi"
        />

        <select
          value={filters.callStatus}
          onChange={(event) =>
            onChange({
              ...filters,
              callStatus: event.target.value as CallStatus | 'all',
            })
          }
          className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          aria-label="Arama durumuna göre filtrele"
        >
          <option value="all">Tüm arama durumları</option>
          {callStatusOptions.map((status) => (
            <option key={status} value={status}>
              {callStatusLabels[status]}
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

        {isAdmin ? (
          <select
            value={filters.userId}
            onChange={(event) =>
              onChange({ ...filters, userId: event.target.value })
            }
            className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            aria-label="Personele göre filtrele"
          >
            <option value="all">Tüm personeller</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.full_name || 'İsimsiz kullanıcı'}
              </option>
            ))}
          </select>
        ) : null}

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
          value={filters.source}
          onChange={(event) =>
            onChange({ ...filters, source: event.target.value })
          }
          className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          aria-label="Kaynağa göre filtrele"
        >
          <option value="all">Tüm kaynaklar</option>
          {sources.map((source) => (
            <option key={source} value={source}>
              {formatSourceLabel(source)}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => onChange({ ...emptyCallFilters })}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Sıfırla
        </button>
      </div>
    </section>
  )
}
