import { ListChecks, MessageCircle, PhoneCall } from 'lucide-react'
import { formatNullableDateTime } from '../../../utils/date'
import { callStatusLabels } from '../../../utils/labels'
import {
  formatPhoneForDisplay,
  getWhatsAppUrl,
} from '../../../utils/phone'
import { getCallTargetProgram } from '../services/callLogService'
import type { CallTargetRecord } from '../types'

type CallLogCardProps = {
  target: CallTargetRecord
  onAddCall: (target: CallTargetRecord) => void
  onCreateTask: (target: CallTargetRecord) => void
}

export function CallLogCard({
  onAddCall,
  onCreateTask,
  target,
}: CallLogCardProps) {
  const program = getCallTargetProgram(target)
  const whatsappUrl = getWhatsAppUrl(target.phone)

  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-neutral-950">
            {target.full_name}
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            {formatPhoneForDisplay(target.phone)}
          </p>
        </div>
        {target.latest_call_log?.call_status ? (
          <span className="inline-flex rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            {callStatusLabels[target.latest_call_log.call_status]}
          </span>
        ) : null}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs font-medium text-neutral-500">Program</dt>
          <dd className="mt-1 font-medium text-neutral-800">
            {program?.name ?? '-'}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-neutral-500">Durum</dt>
          <dd className="mt-1 font-medium text-neutral-800">
            {target.latest_call_log?.call_status
              ? callStatusLabels[target.latest_call_log.call_status]
              : '-'}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs font-medium text-neutral-500">
            Sonraki arama tarihi
          </dt>
          <dd className="mt-1 font-medium text-neutral-800">
            {formatNullableDateTime(target.next_call_date)}
          </dd>
        </div>
      </dl>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
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
          onClick={() => onAddCall(target)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          <PhoneCall className="h-4 w-4" aria-hidden="true" />
          Arama Kaydı
        </button>
        <button
          type="button"
          onClick={() => onCreateTask(target)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          GÃ¶rev
        </button>
      </div>
    </article>
  )
}
