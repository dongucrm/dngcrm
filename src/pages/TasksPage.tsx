import { Plus, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { TaskCard } from '../features/tasks/components/TaskCard'
import { TaskDetailModal } from '../features/tasks/components/TaskDetailModal'
import { TaskFilters } from '../features/tasks/components/TaskFilters'
import { TaskForm } from '../features/tasks/components/TaskForm'
import { TasksTable } from '../features/tasks/components/TasksTable'
import { emptyTaskFilters } from '../features/tasks/constants'
import {
  cancelTask,
  completeTask,
  fetchTaskReferences,
  fetchTasks,
  saveTask,
} from '../features/tasks/services/taskService'
import type {
  TaskFiltersState,
  TaskFormValues,
  TaskRecord,
  TaskReferences,
} from '../features/tasks/types'
import { useAuth } from '../hooks/useAuth'
import { usePageTitle } from '../hooks/usePageTitle'

const emptyReferences: TaskReferences = {
  leads: [],
  parents: [],
  profiles: [],
}

export function TasksPage() {
  usePageTitle('Görevler')

  const { isAdmin, isSales, user } = useAuth()
  const auth = useMemo(
    () => ({
      isAdmin,
      isSales,
      userId: user?.id ?? null,
    }),
    [isAdmin, isSales, user?.id],
  )

  const [filters, setFilters] = useState<TaskFiltersState>({
    ...emptyTaskFilters,
  })
  const [references, setReferences] = useState<TaskReferences>(emptyReferences)
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [editingTask, setEditingTask] = useState<TaskRecord | null>(null)
  const [detailTask, setDetailTask] = useState<TaskRecord | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadReferences = useCallback(async () => {
    const result = await fetchTaskReferences(auth)

    if (result.error) {
      setError(result.error)
      return
    }

    setReferences(result.data ?? emptyReferences)
  }, [auth])

  const loadTasks = useCallback(async () => {
    setLoading(true)
    setError(null)

    const result = await fetchTasks(filters, auth)

    if (result.error) {
      setTasks([])
      setError(result.error)
      setLoading(false)
      return
    }

    setTasks(result.data ?? [])
    setLoading(false)
  }, [auth, filters])

  useEffect(() => {
    void loadReferences()
  }, [loadReferences])

  useEffect(() => {
    void loadTasks()
  }, [loadTasks])

  function openCreateForm() {
    setEditingTask(null)
    setIsFormOpen(true)
  }

  function openEditForm(task: TaskRecord) {
    setEditingTask(task)
    setIsFormOpen(true)
  }

  async function handleSaveTask(
    values: TaskFormValues,
    task?: TaskRecord | null,
  ) {
    setSaving(true)
    const result = await saveTask(values, auth, task)
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

  async function handleCancel(task: TaskRecord) {
    const result = await cancelTask(task)

    if (result.error) {
      setError(result.error)
      return
    }

    await loadTasks()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">Döngü CRM</p>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-950 sm:text-3xl">
            Görevler
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            {isAdmin
              ? 'Tüm görevleri görüntülüyor ve yönetiyorsunuz.'
              : 'Size atanmış görevleri görüntülüyorsunuz.'}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => void loadTasks()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Yenile
          </button>
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Yeni Görev
          </button>
        </div>
      </div>

      <TaskFilters
        filters={filters}
        isAdmin={isAdmin}
        profiles={references.profiles}
        onChange={setFilters}
      />

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-6 text-sm font-medium text-neutral-600 shadow-sm">
          Görevler yükleniyor...
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-950">
            Görev bulunamadı
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Filtreleri değiştirin veya yeni görev oluşturun.
          </p>
        </div>
      ) : (
        <>
          <TasksTable
            auth={auth}
            tasks={tasks}
            onCancel={(task) => void handleCancel(task)}
            onComplete={(task) => void handleComplete(task)}
            onDetail={setDetailTask}
            onEdit={openEditForm}
          />
          <section className="space-y-3 lg:hidden">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                auth={auth}
                task={task}
                onComplete={(nextTask) => void handleComplete(nextTask)}
                onDetail={setDetailTask}
              />
            ))}
          </section>
        </>
      )}

      <TaskForm
        authUserId={user?.id ?? null}
        editingTask={editingTask}
        isAdmin={isAdmin}
        isOpen={isFormOpen}
        references={references}
        saving={saving}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSaveTask}
      />

      <TaskDetailModal task={detailTask} onClose={() => setDetailTask(null)} />
    </div>
  )
}
