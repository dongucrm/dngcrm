import { CheckCircle2, Eye } from 'lucide-react'
import { formatNullableDateTime, isOverdue } from '../../../utils/date'
import { leadPriorityLabels, taskStatusLabels } from '../../../utils/labels'
import { cn } from '../../../utils/cn'
import {
  canCompleteTask,
  getTaskPersonName,
} from '../services/taskService'
import type { TaskAuthContext, TaskRecord } from '../types'

type TaskCardProps = {
  auth: TaskAuthContext
  task: TaskRecord
  onComplete: (task: TaskRecord) => void
  onDetail: (task: TaskRecord) => void
}

export function TaskCard({
  auth,
  onComplete,
  onDetail,
  task,
}: TaskCardProps) {
  const overdue = task.status !== 'tamamlandi' && isOverdue(task.due_date)
  const completeAllowed = task.status !== 'tamamlandi' && canCompleteTask(task, auth)

  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-neutral-950">
            {task.title}
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            {getTaskPersonName(task)}
          </p>
        </div>
        <span
          className={cn(
            'inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold',
            overdue
              ? 'bg-red-50 text-red-700'
              : task.status === 'tamamlandi'
                ? 'bg-emerald-50 text-emerald-700'
                : task.status === 'iptal'
                  ? 'bg-neutral-100 text-neutral-700'
                  : 'bg-amber-50 text-amber-700',
          )}
        >
          {overdue
            ? 'Geciken'
            : task.status
              ? taskStatusLabels[task.status]
              : '-'}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs font-medium text-neutral-500">Son tarih</dt>
          <dd className="mt-1 font-medium text-neutral-800">
            {formatNullableDateTime(task.due_date)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-neutral-500">Öncelik</dt>
          <dd className="mt-1 font-medium text-neutral-800">
            {task.priority ? leadPriorityLabels[task.priority] : '-'}
          </dd>
        </div>
      </dl>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={!completeAllowed}
          onClick={() => onComplete(task)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Tamamla
        </button>
        <button
          type="button"
          onClick={() => onDetail(task)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
          Detay
        </button>
      </div>
    </article>
  )
}
