import {
  Eye,
  ListChecks,
  MessageCircle,
  Pencil,
  PhoneCall,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { leadProbabilityLabels } from '../../utils/labels'
import { LeadPriorityBadge, LeadStatusBadge } from './LeadStatusBadge'
import type { LeadQuickAction, LeadRecord } from './types'
import {
  formatNullableDateTime,
  formatPhoneForDisplay,
  getLeadAssignee,
  getLeadProgram,
  getWhatsAppUrl,
} from './utils'

type LeadTableProps = {
  leads: LeadRecord[]
  onEdit: (lead: LeadRecord) => void
  onQuickAction: (action: LeadQuickAction) => void
}

function formatSource(source: string | null) {
  if (!source) {
    return '-'
  }

  return source
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function LeadTable({ leads, onEdit, onQuickAction }: LeadTableProps) {
  return (
    <section className="hidden rounded-lg border border-neutral-200 bg-white shadow-sm lg:block">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                Lead
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                Program
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                Durum
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                Öncelik
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                İhtimal
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                Sonraki arama
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500">
                Personel
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-neutral-500">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {leads.map((lead) => {
              const program = getLeadProgram(lead)
              const assignee = getLeadAssignee(lead)
              const whatsappUrl = getWhatsAppUrl(lead.phone)

              return (
                <tr key={lead.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-4 align-top">
                    <div className="min-w-56">
                      <p className="font-semibold text-neutral-950">
                        {lead.full_name}
                      </p>
                      <p className="mt-1 text-sm text-neutral-500">
                        {formatPhoneForDisplay(lead.phone)}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {formatSource(lead.source)}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-neutral-700">
                    {program?.name ?? '-'}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <LeadStatusBadge status={lead.status} />
                  </td>
                  <td className="px-4 py-4 align-top">
                    <LeadPriorityBadge priority={lead.priority} />
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-neutral-700">
                    {lead.probability
                      ? leadProbabilityLabels[lead.probability]
                      : '-'}
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-neutral-700">
                    {formatNullableDateTime(lead.next_call_date)}
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-neutral-700">
                    {assignee?.full_name ?? '-'}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/leads/${lead.id}`}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        Detay
                      </Link>
                      <button
                        type="button"
                        onClick={() => onEdit(lead)}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        Düzenle
                      </button>
                      <a
                        href={whatsappUrl ?? undefined}
                        target="_blank"
                        rel="noreferrer"
                        aria-disabled={!whatsappUrl}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-emerald-200 bg-white px-2.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 aria-disabled:pointer-events-none aria-disabled:opacity-50"
                      >
                        <MessageCircle
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                        WhatsApp
                      </a>
                      <button
                        type="button"
                        onClick={() => onQuickAction({ type: 'call', lead })}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                      >
                        <PhoneCall
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                        Arama Kaydı
                      </button>
                      <button
                        type="button"
                        onClick={() => onQuickAction({ type: 'task', lead })}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                      >
                        <ListChecks
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                        Görev
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
