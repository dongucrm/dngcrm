import { CheckCircle2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { formatNullableDateTime } from '../../../utils/date'
import { leadPriorityLabels } from '../../../utils/labels'
import {
  completeTask,
  fetchTodayTasks,
  getTaskPersonName,
} from '../services/taskService'
import type { TaskRecord } from '../types'

export function TodayTasksWidget() {
  const { isAdmin, isSales, user } = useAuth()
  const auth = useMemo(
    () => ({
      isAdmin,
      isSales,
      userId: user?.id ?? null,
    }),
    [isAdmin, isSales, user?.id],
  )
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTasks = useCallback(async () => {
    setLoading(true)
    setError(null)

    const result = await fetchTodayTasks(auth)

    if (result.error) {
      setTasks([])
      setError(result.error)
      setLoading(false)
      return
    }

    setTasks(result.data ?? [])
    setLoading(false)
  }, [auth])

  useEffect(() => {
    void loadTasks()
  }, [loadTasks])

  async function handleComplete(task: TaskRecord) {
    const result = await completeTask(task)

    if (result.error) {
      setError(result.error)
      return
    }

    await loadTasks()
  }

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-neutral-950">
          Bugün Yapılacaklar
        </h2>
        <span className="rounded-lg bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
          {tasks.length} görev
        </span>
      </div>

      {loading ? (
        <p className="mt-4 text-sm font-medium text-neutral-600">
          Görevler yükleniyor...
        </p>
      ) : error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : tasks.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">
          Bugün için açık görev yok.
        </p>
      ) : (
        <div className="mt-4 divide-y divide-neutral-200">
          {tasks.map((task) => (
            <article
              key={task.id}
              className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-neutral-950">
                  {task.title}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  {getTaskPersonName(task)} • {formatNullableDateTime(task.due_date)}
                </p>
                <p className="mt-1 text-xs font-medium text-neutral-600">
                  {task.priority ? leadPriorityLabels[task.priority] : '-'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleComplete(task)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                aria-label="Görevi tamamla"
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
