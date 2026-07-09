import { EyeOff, Pencil, Power } from 'lucide-react'
import { formatNullableDateTime } from '../../../utils/date'
import { whatsappTemplateCategoryLabels } from '../constants'
import type { WhatsAppTemplateRecord } from '../types'

type WhatsAppTemplateCardProps = {
  canManage: boolean
  template: WhatsAppTemplateRecord
  onEdit: (template: WhatsAppTemplateRecord) => void
  onToggleActive: (template: WhatsAppTemplateRecord) => void
}

export function WhatsAppTemplateCard({
  canManage,
  onEdit,
  onToggleActive,
  template,
}: WhatsAppTemplateCardProps) {
  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-neutral-950">
            {template.title}
          </h2>
          <p className="mt-1 text-xs font-medium text-neutral-500">
            {template.category
              ? whatsappTemplateCategoryLabels[
                  template.category as keyof typeof whatsappTemplateCategoryLabels
                ] ?? template.category
              : '-'}{' '}
            · {formatNullableDateTime(template.created_at)}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            template.is_active !== false
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-neutral-100 text-neutral-600'
          }`}
        >
          {template.is_active !== false ? 'Aktif' : 'Pasif'}
        </span>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-700">
        {template.message}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onEdit(template)}
          disabled={!canManage}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
          Düzenle
        </button>
        <button
          type="button"
          onClick={() => onToggleActive(template)}
          disabled={!canManage}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {template.is_active !== false ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Power className="h-4 w-4" aria-hidden="true" />
          )}
          {template.is_active !== false ? 'Pasifleştir' : 'Aktif Yap'}
        </button>
      </div>
    </article>
  )
}
