import { Plus, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { StudentCard } from '../features/students/components/StudentCard'
import { StudentFilters } from '../features/students/components/StudentFilters'
import { StudentForm } from '../features/students/components/StudentForm'
import { StudentsTable } from '../features/students/components/StudentsTable'
import {
  fetchStudentReferences,
  fetchStudents,
  saveStudent,
} from '../features/students/services/studentService'
import type {
  StudentFiltersState,
  StudentFormValues,
  StudentRecord,
  StudentReferences,
} from '../features/students/types'
import { useAuth } from '../hooks/useAuth'
import { usePageTitle } from '../hooks/usePageTitle'

const emptyFilters: StudentFiltersState = {
  activeRegistration: 'all',
  parentId: 'all',
  paymentStatus: 'all',
  programId: 'all',
  search: '',
}

const emptyReferences: StudentReferences = {
  parents: [],
  programs: [],
}

export function StudentsPage() {
  usePageTitle('Öğrenciler')

  const { isAdmin, isSales, user } = useAuth()
  const auth = useMemo(
    () => ({
      isAdmin,
      isSales,
      userId: user?.id ?? null,
    }),
    [isAdmin, isSales, user?.id],
  )
  const [filters, setFilters] = useState<StudentFiltersState>(emptyFilters)
  const [references, setReferences] =
    useState<StudentReferences>(emptyReferences)
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(
    null,
  )
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadReferences = useCallback(async () => {
    const result = await fetchStudentReferences()

    if (result.error) {
      setError(result.error)
      return
    }

    setReferences(result.data ?? emptyReferences)
  }, [])

  const loadStudents = useCallback(async () => {
    setLoading(true)
    setError(null)

    const result = await fetchStudents(filters)

    if (result.error) {
      setStudents([])
      setError(result.error)
      setLoading(false)
      return
    }

    setStudents(result.data ?? [])
    setLoading(false)
  }, [filters])

  useEffect(() => {
    void loadReferences()
  }, [loadReferences])

  useEffect(() => {
    void loadStudents()
  }, [loadStudents])

  function openCreateForm() {
    setEditingStudent(null)
    setIsFormOpen(true)
  }

  function openEditForm(student: StudentRecord) {
    setEditingStudent(student)
    setIsFormOpen(true)
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

    await Promise.all([loadStudents(), loadReferences()])

    return result
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">Döngü CRM</p>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-950 sm:text-3xl">
            Öğrenciler
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Öğrencileri, velilerini ve aktif program kayıtlarını takip edin.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => void loadStudents()}
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
            Yeni Öğrenci
          </button>
        </div>
      </div>

      <StudentFilters
        filters={filters}
        references={references}
        onChange={setFilters}
      />

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-6 text-sm font-medium text-neutral-600 shadow-sm">
          Öğrenciler yükleniyor...
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-950">
            Öğrenci bulunamadı
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Filtreleri değiştirin veya yeni öğrenci ekleyin.
          </p>
        </div>
      ) : (
        <>
          <StudentsTable students={students} onEdit={openEditForm} />
          <section className="space-y-3 lg:hidden">
            {students.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </section>
        </>
      )}

      <StudentForm
        editingStudent={editingStudent}
        isOpen={isFormOpen}
        references={references}
        saving={saving}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSaveStudent}
      />
    </div>
  )
}
