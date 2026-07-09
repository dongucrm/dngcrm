import {
  whatsappTemplateCategories,
  whatsappTemplateCategoryLabels,
} from '../constants'
import type { WhatsAppTemplateFiltersState } from '../types'

type WhatsAppTemplateFiltersProps = {
  filters: WhatsAppTemplateFiltersState
  isAdmin: boolean
  onChange: (filters: WhatsAppTemplateFiltersState) => void
  onReset: () => void
}

export function WhatsAppTemplateFilters({
  filters,
  isAdmin,
  onChange,
  onReset,
}: WhatsAppTemplateFiltersProps) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_160px_auto]">
        <label className="block">
          <span className="text-sm font-medium text-neutral-700">Arama</span>
          <input
            value={filters.search}
            onChange={(event) =>
              onChange({ ...filters, search: event.target.value })
            }
            placeholder="Başlık veya mesaj ara"
            className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-neutral-700">Kategori</span>
          <select
            value={filters.category}
            onChange={(event) =>
              onChange({
                ...filters,
                category: event.target
                  .value as WhatsAppTemplateFiltersState['category'],
              })
            }
            className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">Tümü</option>
            {whatsappTemplateCategories.map((category) => (
              <option key={category} value={category}>
                {whatsappTemplateCategoryLabels[category]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-neutral-700">Durum</span>
          <select
            value={filters.status}
            disabled={!isAdmin}
            onChange={(event) =>
              onChange({
                ...filters,
                status: event.target
                  .value as WhatsAppTemplateFiltersState['status'],
              })
            }
            className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-neutral-50"
          >
            <option value="all">Tümü</option>
            <option value="active">Aktif</option>
            <option value="passive">Pasif</option>
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            Sıfırla
          </button>
        </div>
      </div>
    </section>
  )
}
