import { ExternalLink, GraduationCap, ListChecks, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatNullableDateTime } from '../../../utils/date'
import { formatPhoneForDisplay, getWhatsAppUrl } from '../../../utils/phone'
import type { ParentRecord } from '../types'

type ParentCardProps = {
  parent: ParentRecord
  onAddStudent: (parent: ParentRecord) => void
  onCreateTask: (parent: ParentRecord) => void
}

export function ParentCard({
  onAddStudent,
  onCreateTask,
  parent,
}: ParentCardProps) {
  const whatsappUrl = getWhatsAppUrl(parent.phone)

  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-neutral-950">
            {parent.full_name}
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            {formatPhoneForDisplay(parent.phone)}
          </p>
        </div>
        <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          {parent.student_count} öğrenci
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs font-medium text-neutral-500">Aktif kayıt</dt>
          <dd className="mt-1 font-medium text-neutral-800">
            {parent.active_registration_count}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-neutral-500">Son görüşme</dt>
          <dd className="mt-1 font-medium text-neutral-800">
            {formatNullableDateTime(parent.last_contact_date)}
          </dd>
        </div>
      </dl>

      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        <Link
          to={`/parents/${parent.id}`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          Detay
        </Link>
        <a
          href={whatsappUrl ?? undefined}
          target="_blank"
          rel="noreferrer"
          aria-disabled={!whatsappUrl}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          WhatsApp
        </a>
        <button
          type="button"
          onClick={() => onAddStudent(parent)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          Öğrenci
        </button>
        <button
          type="button"
          onClick={() => onCreateTask(parent)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          Görev
        </button>
      </div>
    </article>
  )
}
