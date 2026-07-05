import { Plus, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ParentCard } from '../features/parents/components/ParentCard'
import { ParentFilters } from '../features/parents/components/ParentFilters'
import { ParentForm } from '../features/parents/components/ParentForm'
import { ParentsTable } from '../features/parents/components/ParentsTable'
import {
  fetchParentReferences,
  fetchParents,
  saveParent,
} from '../features/parents/services/parentService'
import type {
  ParentFiltersState,
  ParentFormValues,
  ParentRecord,
  ParentReferences,
} from '../features/parents/types'
import { StudentForm } from '../features/students/components/StudentForm'
import {
  fetchStudentReferences,
  saveStudent,
} from '../features/students/services/studentService'
import type {
  StudentFormValues,
  StudentRecord,
  StudentReferences,
} from '../features/students/types'
import { TaskForm } from '../features/tasks/components/TaskForm'
import {
  createTaskValuesFromParent,
  fetchTaskReferences,
  saveTask,
} from '../features/tasks/services/taskService'
import type {
  TaskFormValues,
  TaskReferences,
} from '../features/tasks/types'
import { useAuth } from '../hooks/useAuth'
import { usePageTitle } from '../hooks/usePageTitle'

const emptyFilters: ParentFiltersState = {
  activeRegistration: 'all',
  paymentStatus: 'all',
  programId: 'all',
  search: '',
}

const emptyParentReferences: ParentReferences = {
  programs: [],
  whatsappTemplates: [],
}

const emptyStudentReferences: StudentReferences = {
  parents: [],
  programs: [],
}

const emptyTaskReferences: TaskReferences = {
  leads: [],
  parents: [],
  profiles: [],
}

export function ParentsPage() {
  usePageTitle('Veliler')

  const { isAdmin, isSales, user } = useAuth()
  const auth = useMemo(
    () => ({
      isAdmin,
      isSales,
      userId: user?.id ?? null,
    }),
    [isAdmin, isSales, user?.id],
  )
  const [filters, setFilters] = useState<ParentFiltersState>(emptyFilters)
  const [parentReferences, setParentReferences] = useState<ParentReferences>(
    emptyParentReferences,
  )
  const [studentReferences, setStudentReferences] =
    useState<StudentReferences>(emptyStudentReferences)
  const [taskReferences, setTaskReferences] =
    useState<TaskReferences>(emptyTaskReferences)
  const [parents, setParents] = useState<ParentRecord[]>([])
  const [editingParent, setEditingParent] = useState<ParentRecord | null>(null)
  const [studentParent, setStudentParent] = useState<ParentRecord | null>(null)
  const [taskParent, setTaskParent] = useState<ParentRecord | null>(null)
  const [isParentFormOpen, setIsParentFormOpen] = useState(false)
  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadReferences = useCallback(async () => {
    const [parentResult, studentResult, taskResult] = await Promise.all([
      fetchParentReferences(),
      fetchStudentReferences(),
      fetchTaskReferences(auth),
    ])

    if (parentResult.data) {
      setParentReferences(parentResult.data)
    }

    if (studentResult.data) {
      setStudentReferences(studentResult.data)
    }

    if (taskResult.data) {
      setTaskReferences(taskResult.data)
    }

    const referenceError =
      parentResult.error ?? studentResult.error ?? taskResult.error

    if (referenceError) {
      setError(referenceError)
    }
  }, [auth])

  const loadParents = useCallback(async () => {
    setLoading(true)
    setError(null)

    const result = await fetchParents(filters)

    if (result.error) {
      setParents([])
      setError(result.error)
      setLoading(false)
      return
    }

    setParents(result.data ?? [])
    setLoading(false)
  }, [filters])

  useEffect(() => {
    void loadReferences()
  }, [loadReferences])

  useEffect(() => {
    void loadParents()
  }, [loadParents])

  function openCreateParent() {
    setEditingParent(null)
    setIsParentFormOpen(true)
  }

  function openEditParent(parent: ParentRecord) {
    setEditingParent(parent)
    setIsParentFormOpen(true)
  }

  function openStudentForm(parent: ParentRecord) {
    setStudentParent(parent)
    setIsStudentFormOpen(true)
  }

  async function handleSaveParent(
    values: ParentFormValues,
    parent?: ParentRecord | null,
  ) {
    setSaving(true)
    const result = await saveParent(values, auth, parent)
    setSaving(false)

    if (result.error) {
      return result
    }

    await Promise.all([loadParents(), loadReferences()])

    return result
  }

  async function handleSaveStudent(
    values: StudentFormValues,
    student?: StudentRecord | null,
  ) {
    setSaving(true)
    const result = await saveStudent(values, auth, student)
    setSaving(false)

    if (result.error) {
      return result
    }

    await Promise.all([loadParents(), loadReferences()])

    return result
  }

  async function handleSaveTask(values: TaskFormValues) {
    setSaving(true)
    const result = await saveTask(values, auth)
    setSaving(false)

    if (result.error) {
      return result
    }

    setTaskParent(null)
    return result
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">Döngü CRM</p>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-950 sm:text-3xl">
            Veliler
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Veli kayıtlarını, bağlı öğrencileri, ödeme ve görüşme özetlerini
            takip edin.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => void loadParents()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Yenile
          </button>
          <button
            type="button"
            onClick={openCreateParent}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Yeni Veli
          </button>
        </div>
      </div>

      <ParentFilters
        filters={filters}
        references={parentReferences}
        onChange={setFilters}
      />

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-6 text-sm font-medium text-neutral-600 shadow-sm">
          Veliler yükleniyor...
        </div>
      ) : parents.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-950">
            Veli bulunamadı
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Filtreleri değiştirin veya yeni veli ekleyin.
          </p>
        </div>
      ) : (
        <>
          <ParentsTable
            parents={parents}
            onAddStudent={openStudentForm}
            onCreateTask={setTaskParent}
            onEdit={openEditParent}
          />
          <section className="space-y-3 lg:hidden">
            {parents.map((parent) => (
              <ParentCard
                key={parent.id}
                parent={parent}
                onAddStudent={openStudentForm}
                onCreateTask={setTaskParent}
              />
            ))}
          </section>
        </>
      )}

      <ParentForm
        editingParent={editingParent}
        isOpen={isParentFormOpen}
        saving={saving}
        onClose={() => setIsParentFormOpen(false)}
        onSubmit={handleSaveParent}
      />

      <StudentForm
        editingStudent={null}
        initialParentId={studentParent?.id}
        isOpen={isStudentFormOpen}
        references={studentReferences}
        saving={saving}
        onClose={() => setIsStudentFormOpen(false)}
        onSubmit={handleSaveStudent}
      />

      <TaskForm
        authUserId={user?.id ?? null}
        editingTask={null}
        initialValues={
          taskParent
            ? createTaskValuesFromParent(taskParent.id, user?.id)
            : undefined
        }
        isAdmin={isAdmin}
        isOpen={Boolean(taskParent)}
        references={taskReferences}
        saving={saving}
        onClose={() => setTaskParent(null)}
        onSubmit={handleSaveTask}
      />
    </div>
  )
}
