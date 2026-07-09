import {
  Eye,
  ListChecks,
  MessageCircle,
  Pencil,
  PhoneCall,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useWhatsAppMessage } from '../whatsapp/providers/WhatsAppMessageContext'
import { leadProbabilityLabels } from '../../utils/labels'
import { LeadPriorityBadge, LeadStatusBadge } from './LeadStatusBadge'
import type { LeadQuickAction, LeadRecord } from './types'
import {
  formatNullableDateTime,
  formatPhoneForDisplay,
  getLeadAssignee,
  getLeadProgram,
} from './utils'

type LeadMobileCardsProps = {
  leads: LeadRecord[]
  onEdit: (lead: LeadRecord) => void
  onQuickAction: (action: LeadQuickAction) => void
}

export function LeadMobileCards({
  leads,
  onEdit,
  onQuickAction,
}: LeadMobileCardsProps) {
  const { openWhatsAppMessage } = useWhatsAppMessage()

  return (
    <section className="space-y-3 lg:hidden">
      {leads.map((lead) => {
        const program = getLeadProgram(lead)
        const assignee = getLeadAssignee(lead)

        return (
          <article
            key={lead.id}
            className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-neutral-950">
                  {lead.full_name}
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  {formatPhoneForDisplay(lead.phone)}
                </p>
              </div>
              <LeadStatusBadge status={lead.status} />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs font-medium text-neutral-500">
                  Program
                </dt>
                <dd className="mt-1 font-medium text-neutral-800">
                  {program?.name ?? '-'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-neutral-500">
                  Personel
                </dt>
                <dd className="mt-1 font-medium text-neutral-800">
                  {assignee?.full_name ?? '-'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-neutral-500">
                  Öncelik
                </dt>
                <dd className="mt-1">
                  <LeadPriorityBadge priority={lead.priority} />
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-neutral-500">
                  İhtimal
                </dt>
                <dd className="mt-1 font-medium text-neutral-800">
                  {lead.probability
                    ? leadProbabilityLabels[lead.probability]
                    : '-'}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs font-medium text-neutral-500">
                  Sonraki arama
                </dt>
                <dd className="mt-1 font-medium text-neutral-800">
                  {formatNullableDateTime(lead.next_call_date)}
                </dd>
              </div>
            </dl>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link
                to={`/leads/${lead.id}`}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
                Detay
              </Link>
              <button
                type="button"
                onClick={() => onEdit(lead)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Düzenle
              </button>
              <button
                type="button"
                onClick={() =>
                  openWhatsAppMessage({
                    defaultCategory: 'lead',
                    entityId: lead.id,
                    entityType: 'lead',
                    name: lead.full_name,
                    phone: lead.phone,
                    variables: {
                      cocuk_adi: lead.child_name,
                      cocuk_yasi: lead.child_age,
                      kaynak: lead.source,
                      program_adi: program?.name,
                      sonraki_arama_tarihi: formatNullableDateTime(
                        lead.next_call_date,
                      ),
                      telefon: lead.phone,
                      veli_adi: lead.full_name,
                    },
                  })
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 aria-disabled:pointer-events-none aria-disabled:opacity-50"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                WhatsApp
              </button>
              <button
                type="button"
                onClick={() => onQuickAction({ type: 'call', lead })}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                <PhoneCall className="h-4 w-4" aria-hidden="true" />
                Arama
              </button>
              <button
                type="button"
                onClick={() => onQuickAction({ type: 'task', lead })}
                className="col-span-2 inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                <ListChecks className="h-4 w-4" aria-hidden="true" />
                Görev Oluştur
              </button>
            </div>
          </article>
        )
      })}
    </section>
  )
}
