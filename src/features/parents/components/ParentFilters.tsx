import { RotateCcw, Search } from 'lucide-react'
import type { PaymentStatus } from '../../../types/database'
import { paymentStatusLabels } from '../../../utils/labels'
import type { ParentFiltersState, ParentReferences } from '../types'

type ParentFiltersProps = {
  filters: ParentFiltersState
  references: ParentReferences
  onChange: (filters: ParentFiltersState) => void
}

const paymentStatusOptions: PaymentStatus[] = [
  'odenmedi',
  'kismi_odendi',
  'odendi',
  'gecikti',
  'iptal',
]

const emptyFilters: ParentFiltersState = {
  activeRegistration: 'all',
  paymentStatus: 'all',
  programId: 'all',
  search: '',
}

export function ParentFilters({
  filters,
  onChange,
  references,
}: ParentFiltersProps) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <label className="relative md:col-span-2 xl:col-span-1">
          <span className="sr-only">Veli ara</span>
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
            placeholder="Veli, telefon veya öğrenci ara"
            className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm text-neutral-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </label>

        <select
          value={filters.programId}
          onChange={(event) =>
            onChange({ ...filters, programId: event.target.value })
          }
          className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          aria-label="Programa göre filtrele"
        >
          <option value="all">Tüm programlar</option>
          {references.programs.map((program) => (
            <option key={program.id} value={program.id}>
              {program.name}
            </option>
          ))}
        </select>

        <select
          value={filters.paymentStatus}
          onChange={(event) =>
            onChange({
              ...filters,
              paymentStatus: event.target.value as PaymentStatus | 'all',
            })
          }
          className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          aria-label="Ödeme durumuna göre filtrele"
        >
          <option value="all">Tüm ödeme durumları</option>
          {paymentStatusOptions.map((status) => (
            <option key={status} value={status}>
              {paymentStatusLabels[status]}
            </option>
          ))}
        </select>

        <select
          value={filters.activeRegistration}
          onChange={(event) =>
            onChange({
              ...filters,
              activeRegistration: event.target
                .value as ParentFiltersState['activeRegistration'],
            })
          }
          className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          aria-label="Aktif kayda göre filtrele"
        >
          <option value="all">Tüm kayıtlar</option>
          <option value="yes">Aktif kayıt var</option>
          <option value="no">Aktif kayıt yok</option>
        </select>

        <button
          type="button"
          onClick={() => onChange(emptyFilters)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Sıfırla
        </button>
      </div>
    </section>
  )
}
