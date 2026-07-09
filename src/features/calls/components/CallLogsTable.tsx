import {
  Eye,
  ListChecks,
  MessageCircle,
  PhoneCall,
  ExternalLink,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatNullableDateTime } from '../../../utils/date'
import {
  callStatusLabels,
  leadPriorityLabels,
  leadProbabilityLabels,
} from '../../../utils/labels'
import { formatPhoneForDisplay } from '../../../utils/phone'
import { useWhatsAppMessage } from '../../whatsapp/providers/WhatsAppMessageContext'
import {
  getCallTargetAssignee,
  getCallTargetProgram,
} from '../services/callLogService'
import type { CallLogRecord, CallTargetRecord } from '../types'

type CallLogsTableProps = {
  authUserId: string | null
  isAdmin: boolean
  targets: CallTargetRecord[]
  onAddCall: (target: CallTargetRecord) => void
  onEditLog: (log: CallLogRecord) => void
  onCreateTask: (target: CallTargetRecord) => void
}

function canEditLog(
  log: CallLogRecord | null | undefined,
  isAdmin: boolean,
  authUserId: string | null,
) {
  return Boolean(log && (isAdmin || log.user_id === authUserId))
}

function CallStatusPill({ log }: { log: CallLogRecord | null | undefined }) {
  if (!log?.call_status) {
    return <span className="text-sm text-neutral-400">-</span>
  }

  return (
    <span className="inline-flex rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
      {callStatusLabels[log.call_status]}
    </span>
  )
}

export function CallLogsTable({
  authUserId,
  isAdmin,
  onAddCall,
  onCreateTask,
  onEditLog,
  targets,
}: CallLogsTableProps) {
  const { openWhatsAppMessage } = useWhatsAppMessage()

  return (
    <section className="hidden rounded-lg border border-neutral-200 bg-white shadow-sm lg:block">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              {[
                'Veli / Lead adı',
                'Telefon',
                'Çocuk adı',
                'Program',
                'Arama durumu',
                'Kayıt ihtimali',
                'Öncelik',
                'Son görüşme',
                'Sonraki arama',
                'Personel',
                'İşlemler',
              ].map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500 last:text-right"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {targets.map((target) => {
              const program = getCallTargetProgram(target)
              const assignee = getCallTargetAssignee(target)
              const latestLog = target.latest_call_log
              const isLogEditable = canEditLog(latestLog, isAdmin, authUserId)

              return (
                <tr key={target.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-4 align-top">
                    <div className="min-w-48">
                      <p className="font-semibold text-neutral-950">
                        {target.full_name}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {target.source || '-'}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-neutral-700">
                    {formatPhoneForDisplay(target.phone)}
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-neutral-700">
                    {target.child_name || '-'}
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-neutral-700">
                    {program?.name ?? '-'}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <CallStatusPill log={latestLog} />
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-neutral-700">
                    {target.probability
                      ? leadProbabilityLabels[target.probability]
                      : '-'}
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-neutral-700">
                    {target.priority ? leadPriorityLabels[target.priority] : '-'}
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-neutral-700">
                    {formatNullableDateTime(target.last_contact_date)}
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-neutral-700">
                    {formatNullableDateTime(target.next_call_date)}
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-neutral-700">
                    {assignee?.full_name ?? '-'}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openWhatsAppMessage({
                            defaultCategory: 'lead',
                            entityId: target.id,
                            entityType: 'lead',
                            name: target.full_name,
                            phone: target.phone,
                            variables: {
                              cocuk_adi: target.child_name,
                              cocuk_yasi: target.child_age,
                              kaynak: target.source,
                              program_adi: program?.name,
                              sonraki_arama_tarihi: target.next_call_date,
                              telefon: target.phone,
                              veli_adi: target.full_name,
                            },
                          })
                        }
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-emerald-200 bg-white px-2.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 aria-disabled:pointer-events-none aria-disabled:opacity-50"
                      >
                        <MessageCircle
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                        WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={() => onAddCall(target)}
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
                        disabled={!latestLog || !isLogEditable}
                        onClick={() => latestLog && onEditLog(latestLog)}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        Detay
                      </button>
                      <Link
                        to={`/leads/${target.id}`}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                      >
                        <ExternalLink
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                        Lead'e Git
                      </Link>
                      <button
                        type="button"
                        onClick={() => onCreateTask(target)}
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
