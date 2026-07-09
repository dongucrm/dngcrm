import { EyeOff, Pencil, Power } from 'lucide-react'
import { formatNullableDateTime } from '../../../utils/date'
import { whatsappTemplateCategoryLabels } from '../constants'
import type { WhatsAppTemplateRecord } from '../types'

type WhatsAppTemplatesTableProps = {
  canManage: boolean
  templates: WhatsAppTemplateRecord[]
  onEdit: (template: WhatsAppTemplateRecord) => void
  onToggleActive: (template: WhatsAppTemplateRecord) => void
}

export function WhatsAppTemplatesTable({
  canManage,
  onEdit,
  onToggleActive,
  templates,
}: WhatsAppTemplatesTableProps) {
  return (
    <section className="hidden rounded-lg border border-neutral-200 bg-white shadow-sm lg:block">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                Şablon
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                Kategori
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                Durum
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                Oluşturulma
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-neutral-500">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {templates.map((template) => (
              <tr key={template.id} className="hover:bg-neutral-50">
                <td className="px-4 py-4 align-top">
                  <p className="font-semibold text-neutral-950">
                    {template.title}
                  </p>
                  <p className="mt-1 line-clamp-2 max-w-xl text-sm text-neutral-500">
                    {template.message}
                  </p>
                </td>
                <td className="px-4 py-4 align-top text-sm text-neutral-700">
                  {template.category
                    ? whatsappTemplateCategoryLabels[
                        template.category as keyof typeof whatsappTemplateCategoryLabels
                      ] ?? template.category
                    : '-'}
                </td>
                <td className="px-4 py-4 align-top">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      template.is_active !== false
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {template.is_active !== false ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td className="px-4 py-4 align-top text-sm text-neutral-700">
                  {formatNullableDateTime(template.created_at)}
                </td>
                <td className="px-4 py-4 align-top">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(template)}
                      disabled={!canManage}
                      className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleActive(template)}
                      disabled={!canManage}
                      className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {template.is_active !== false ? (
                        <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <Power className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {template.is_active !== false ? 'Pasifleştir' : 'Aktif Yap'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
