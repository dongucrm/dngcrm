import { CheckCircle2, Plus } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { formatNullableDateTime } from '../../../utils/date'
import { leadPriorityLabels, taskStatusLabels } from '../../../utils/labels'
import {
  completeTask,
  createTaskValuesFromLead,
  fetchTaskReferences,
  fetchTasksForLead,
  saveTask,
} from '../services/taskService'
import type { TaskFormValues, TaskRecord, TaskReferences } from '../types'
import { TaskForm } from './TaskForm'

type LeadTasksSectionProps = {
  assignedUserId?: string | null
  leadId: string
}

const emptyReferences: TaskReferences = {
  leads: [],
  parents: [],
  profiles: [],
}

export function LeadTasksSection({
  assignedUserId,
  leadId,
}: LeadTasksSectionProps) {
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
  const [references, setReferences] = useState<TaskReferences>(emptyReferences)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTasks = useCallback(async () => {
    setLoading(true)
    setError(null)

    const result = await fetchTasksForLead(leadId, auth)

    if (result.error) {
      setTasks([])
      setError(result.error)
      setLoading(false)
      return
    }

    setTasks(result.data ?? [])
    setLoading(false)
  }, [auth, leadId])

  useEffect(() => {
    async function loadReferences() {
      const result = await fetchTaskReferences(auth)

      if (result.data) {
        setReferences(result.data)
      }
    }

    void loadReferences()
    void loadTasks()
  }, [auth, loadTasks])

  async function handleSaveTask(values: TaskFormValues) {
    setSaving(true)
    const result = await saveTask(values, auth)
    setSaving(false)

    if (result.error) {
      return result
    }

    await loadTasks()

    return result
  }

  async function handleComplete(task: TaskRecord) {
    const result = await completeTask(task)

    if (result.error) {
      setError(result.error)
      return
    }

    await loadTasks()
  }

  const initialValues = createTaskValuesFromLead(
    leadId,
    assignedUserId ?? user?.id,
  )

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-950">Görevler</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Bu lead ile ilişkili görevler
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Yeni Görev
        </button>
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
          Bu lead için görev bulunmuyor.
        </p>
      ) : (
        <div className="mt-4 divide-y divide-neutral-200">
          {tasks.map((task) => (
            <article
              key={task.id}
              className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-semibold text-neutral-950">{task.title}</p>
                <p className="mt-1 text-sm text-neutral-500">
                  Son tarih: {formatNullableDateTime(task.due_date)}
                </p>
                <p className="mt-1 text-xs font-medium text-neutral-600">
                  {task.priority ? leadPriorityLabels[task.priority] : '-'} •{' '}
                  {task.status ? taskStatusLabels[task.status] : '-'}
                </p>
              </div>
              <button
                type="button"
                disabled={task.status === 'tamamlandi'}
                onClick={() => void handleComplete(task)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Tamamlandı Yap
              </button>
            </article>
          ))}
        </div>
      )}

      <TaskForm
        authUserId={user?.id ?? null}
        editingTask={null}
        initialValues={initialValues}
        isAdmin={isAdmin}
        isOpen={isFormOpen}
        references={references}
        saving={saving}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSaveTask}
      />
    </section>
  )
}
