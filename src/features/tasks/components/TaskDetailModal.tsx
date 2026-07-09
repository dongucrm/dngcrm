import { MessageCircle, X } from 'lucide-react'
import { formatNullableDateTime } from '../../../utils/date'
import { leadPriorityLabels, taskStatusLabels } from '../../../utils/labels'
import { useWhatsAppMessage } from '../../whatsapp/providers/WhatsAppMessageContext'
import {
  getTaskAssignee,
  getTaskLead,
  getTaskParent,
  getTaskPersonName,
  getTaskProgram,
} from '../services/taskService'
import type { TaskRecord } from '../types'

type TaskDetailModalProps = {
  task: TaskRecord | null
  onClose: () => void
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
      <dt className="text-xs font-semibold uppercase text-neutral-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-neutral-900">{value}</dd>
    </div>
  )
}

export function TaskDetailModal({ onClose, task }: TaskDetailModalProps) {
  const { openWhatsAppMessage } = useWhatsAppMessage()

  if (!task) {
    return null
  }

  const lead = getTaskLead(task)
  const parent = getTaskParent(task)
  const assignee = getTaskAssignee(task)
  const program = getTaskProgram(task)
  const messageTarget = lead ?? parent

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-neutral-950/40 px-4 py-6">
      <section className="w-full max-w-3xl rounded-lg border border-neutral-200 bg-white shadow-lg">
        <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-5 py-4">
          <div>
            <p className="text-sm font-medium text-emerald-700">
              Görev Detayı
            </p>
            <h2 className="text-lg font-semibold text-neutral-950">
              {task.title}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!messageTarget?.phone}
              onClick={() =>
                messageTarget &&
                openWhatsAppMessage({
                  defaultCategory: lead ? 'lead' : 'veli',
                  entityId: task.id,
                  entityType: 'task',
                  name: messageTarget.full_name,
                  phone: messageTarget.phone,
                  variables: {
                    cocuk_adi: lead?.child_name,
                    program_adi: program?.name,
                    telefon: messageTarget.phone,
                    veli_adi: messageTarget.full_name,
                  },
                })
              }
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-emerald-200 px-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              WhatsApp
            </button>
            <button
              type="button"
              aria-label="Kapat"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              onClick={onClose}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="space-y-5 px-5 py-5">
          <section className="grid gap-3 md:grid-cols-2">
            <DetailRow label="İlgili kişi" value={getTaskPersonName(task)} />
            <DetailRow label="Program" value={program?.name ?? '-'} />
            <DetailRow label="İlgili lead" value={lead?.full_name ?? '-'} />
            <DetailRow label="İlgili veli" value={parent?.full_name ?? '-'} />
            <DetailRow
              label="Atanan personel"
              value={assignee?.full_name ?? '-'}
            />
            <DetailRow
              label="Son tarih"
              value={formatNullableDateTime(task.due_date)}
            />
            <DetailRow
              label="Öncelik"
              value={task.priority ? leadPriorityLabels[task.priority] : '-'}
            />
            <DetailRow
              label="Durum"
              value={task.status ? taskStatusLabels[task.status] : '-'}
            />
            <DetailRow
              label="Oluşturulma"
              value={formatNullableDateTime(task.created_at)}
            />
          </section>

          <section>
            <h3 className="text-sm font-semibold text-neutral-950">
              Açıklama
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-700">
              {task.description || '-'}
            </p>
          </section>
        </div>
      </section>
    </div>
  )
}
