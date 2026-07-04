import { ArrowLeft, MessageCircle } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { CallHistorySection } from '../features/calls/components/CallHistorySection'
import { LeadPriorityBadge, LeadStatusBadge } from '../features/leads/LeadStatusBadge'
import { useLeadDetail } from '../features/leads/useLeadDetail'
import {
  getLeadAssignee,
  getLeadProgram,
} from '../features/leads/utils'
import { LeadTasksSection } from '../features/tasks/components/LeadTasksSection'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatNullableDateTime } from '../utils/date'
import {
  leadProbabilityLabels,
  leadStatusLabels,
} from '../utils/labels'
import { formatPhoneForDisplay, getWhatsAppUrl } from '../utils/phone'

function DetailField({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <dt className="text-xs font-semibold uppercase text-neutral-500">
        {label}
      </dt>
      <dd className="mt-2 text-sm font-medium text-neutral-900">
        {value || '-'}
      </dd>
    </div>
  )
}

export function LeadDetailPage() {
  const { leadId } = useParams()
  const { error, lead, loading } = useLeadDetail(leadId)

  usePageTitle(lead ? `${lead.full_name} Lead Detayı` : 'Lead Detayı')

  if (loading) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-6 text-sm font-medium text-neutral-600 shadow-sm">
        Lead detayı yükleniyor...
      </div>
    )
  }

  if (error || !lead) {
    return (
      <div className="space-y-4">
        <Link
          to="/leads"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Lead listesine dön
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error ?? 'Lead detayı bulunamadı.'}
        </div>
      </div>
    )
  }

  const program = getLeadProgram(lead)
  const assignee = getLeadAssignee(lead)
  const whatsappUrl = getWhatsAppUrl(lead.phone)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/leads"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Lead listesine dön
          </Link>
          <p className="mt-5 text-sm font-medium text-emerald-700">
            Lead / Potansiyel Müşteri
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-950 sm:text-3xl">
            {lead.full_name}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            {formatPhoneForDisplay(lead.phone)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <LeadStatusBadge status={lead.status} />
          <LeadPriorityBadge priority={lead.priority} />
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              WhatsApp
            </a>
          ) : null}
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <DetailField label="Email" value={lead.email} />
        <DetailField label="Çocuk adı" value={lead.child_name} />
        <DetailField
          label="Çocuk yaşı"
          value={lead.child_age ? String(lead.child_age) : null}
        />
        <DetailField label="Program" value={program?.name} />
        <DetailField label="Kaynak" value={lead.source} />
        <DetailField
          label="Satış aşaması"
          value={lead.status ? leadStatusLabels[lead.status] : null}
        />
        <DetailField
          label="Kayıt ihtimali"
          value={
            lead.probability ? leadProbabilityLabels[lead.probability] : null
          }
        />
        <DetailField label="Atanan personel" value={assignee?.full_name} />
        <DetailField
          label="Son görüşme"
          value={formatNullableDateTime(lead.last_contact_date)}
        />
        <DetailField
          label="Sonraki arama"
          value={formatNullableDateTime(lead.next_call_date)}
        />
        <DetailField
          label="Oluşturulma"
          value={formatNullableDateTime(lead.created_at)}
        />
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-neutral-950">Notlar</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-700">
          {lead.notes || '-'}
        </p>
      </section>

      <LeadTasksSection leadId={lead.id} assignedUserId={lead.assigned_user_id} />

      <CallHistorySection leadId={lead.id} />
    </div>
  )
}
