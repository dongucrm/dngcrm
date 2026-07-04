import { CheckCircle2, Eye, Pencil, XCircle } from 'lucide-react'
import { formatNullableDateTime, isOverdue } from '../../../utils/date'
import { leadPriorityLabels, taskStatusLabels } from '../../../utils/labels'
import { cn } from '../../../utils/cn'
import {
  canCompleteTask,
  canEditTask,
  getTaskAssignee,
  getTaskPersonName,
  getTaskProgram,
} from '../services/taskService'
import type { TaskAuthContext, TaskRecord } from '../types'

type TasksTableProps = {
  auth: TaskAuthContext
  tasks: TaskRecord[]
  onCancel: (task: TaskRecord) => void
  onComplete: (task: TaskRecord) => void
  onDetail: (task: TaskRecord) => void
  onEdit: (task: TaskRecord) => void
}

function StatusBadge({ task }: { task: TaskRecord }) {
  const overdue = task.status !== 'tamamlandi' && isOverdue(task.due_date)
  const label = task.status ? taskStatusLabels[task.status] : '-'

  return (
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
      {overdue ? 'Geciken' : label}
    </span>
  )
}

export function TasksTable({
  auth,
  onCancel,
  onComplete,
  onDetail,
  onEdit,
  tasks,
}: TasksTableProps) {
  return (
    <section className="hidden rounded-lg border border-neutral-200 bg-white shadow-sm lg:block">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              {[
                'Görev başlığı',
                'İlgili kişi',
                'İlgili program',
                'Atanan personel',
                'Son tarih',
                'Öncelik',
                'Durum',
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
            {tasks.map((task) => {
              const assignee = getTaskAssignee(task)
              const program = getTaskProgram(task)
              const completeAllowed =
                task.status !== 'tamamlandi' && canCompleteTask(task, auth)
              const editAllowed = canEditTask(task, auth)
              const cancelAllowed = editAllowed && task.status !== 'iptal'

              return (
                <tr key={task.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-4 align-top">
                    <div className="min-w-56">
                      <p className="font-semibold text-neutral-950">
                        {task.title}
                      </p>
                      <p className="mt-1 line-clamp-1 text-sm text-neutral-500">
                        {task.description || '-'}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-neutral-700">
                    {getTaskPersonName(task)}
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-neutral-700">
                    {program?.name ?? '-'}
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-neutral-700">
                    {assignee?.full_name ?? '-'}
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-neutral-700">
                    {formatNullableDateTime(task.due_date)}
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-neutral-700">
                    {task.priority ? leadPriorityLabels[task.priority] : '-'}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <StatusBadge task={task} />
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onDetail(task)}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        Detay
                      </button>
                      <button
                        type="button"
                        disabled={!editAllowed}
                        onClick={() => onEdit(task)}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        Düzenle
                      </button>
                      <button
                        type="button"
                        disabled={!completeAllowed}
                        onClick={() => onComplete(task)}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-emerald-200 bg-white px-2.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <CheckCircle2
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                        Tamamla
                      </button>
                      <button
                        type="button"
                        disabled={!cancelAllowed}
                        onClick={() => onCancel(task)}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        İptal
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
