import { RotateCcw, Search } from 'lucide-react'
import type { LeadPriority, TaskStatus } from '../../../types/database'
import { leadPriorityLabels, taskStatusLabels } from '../../../utils/labels'
import {
  emptyTaskFilters,
  taskFilterPresetOptions,
  taskPriorityOptions,
  taskStatusOptions,
} from '../constants'
import type { TaskFilterPreset, TaskFiltersState, TaskProfile } from '../types'

type TaskFiltersProps = {
  filters: TaskFiltersState
  isAdmin: boolean
  profiles: TaskProfile[]
  onChange: (filters: TaskFiltersState) => void
}

export function TaskFilters({
  filters,
  isAdmin,
  onChange,
  profiles,
}: TaskFiltersProps) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <label className="relative md:col-span-2 xl:col-span-1">
          <span className="sr-only">Görev ara</span>
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
            placeholder="Başlık veya açıklama ara"
            className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm text-neutral-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </label>

        <select
          value={filters.preset}
          onChange={(event) =>
            onChange({
              ...filters,
              preset: event.target.value as TaskFilterPreset,
            })
          }
          className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          aria-label="Görev hızlı filtresi"
        >
          {taskFilterPresetOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(event) =>
            onChange({
              ...filters,
              status: event.target.value as TaskStatus | 'all',
            })
          }
          className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          aria-label="Duruma göre filtrele"
        >
          <option value="all">Tüm durumlar</option>
          {taskStatusOptions.map((status) => (
            <option key={status} value={status}>
              {taskStatusLabels[status]}
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
          {taskPriorityOptions.map((priority) => (
            <option key={priority} value={priority}>
              {leadPriorityLabels[priority]}
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

        <button
          type="button"
          onClick={() => onChange({ ...emptyTaskFilters })}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Sıfırla
        </button>
      </div>
    </section>
  )
}
