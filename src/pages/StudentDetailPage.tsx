import { ArrowLeft, FilePlus2, NotebookPen, UserPen, UsersRound } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { NotesSection } from '../features/notes/components/NotesSection'
import { RegistrationForm } from '../features/registrations/components/RegistrationForm'
import {
  fetchRegistrationReferences,
  saveRegistration,
} from '../features/registrations/services/registrationService'
import type {
  RegistrationFormValues,
  RegistrationRecord,
  RegistrationReferences,
  RegistrationSaveOptions,
} from '../features/registrations/types'
import { StudentForm } from '../features/students/components/StudentForm'
import {
  fetchStudentDetail,
  fetchStudentReferences,
  getStudentParent,
  saveStudent,
} from '../features/students/services/studentService'
import type {
  StudentFormValues,
  StudentRecord,
  StudentReferences,
} from '../features/students/types'
import { useAuth } from '../hooks/useAuth'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatNullableDateTime } from '../utils/date'
import {
  paymentStatusLabels,
  registrationStatusLabels,
} from '../utils/labels'

const emptyReferences: StudentReferences = {
  parents: [],
  programs: [],
}

const emptyRegistrationReferences: RegistrationReferences = {
  parents: [],
  programs: [],
  students: [],
  whatsappTemplates: [],
}

function DetailField({
  label,
  value,
}: {
  label: string
  value: string | number | null | undefined
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <dt className="text-xs font-semibold uppercase text-neutral-500">
        {label}
      </dt>
      <dd className="mt-2 text-sm font-medium text-neutral-900">
        {value || '-'}
      </dd>
    </div>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    currency: 'TRY',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value)
}

function normalizeRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

export function StudentDetailPage() {
  const { studentId } = useParams()
  const { isAdmin, isSales, user } = useAuth()
  const auth = useMemo(
    () => ({
      isAdmin,
      isSales,
      userId: user?.id ?? null,
    }),
    [isAdmin, isSales, user?.id],
  )
  const [student, setStudent] = useState<StudentRecord | null>(null)
  const [references, setReferences] =
    useState<StudentReferences>(emptyReferences)
  const [registrationReferences, setRegistrationReferences] =
    useState<RegistrationReferences>(emptyRegistrationReferences)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isRegistrationFormOpen, setIsRegistrationFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  usePageTitle(student ? `${student.full_name} Öğrenci Detayı` : 'Öğrenci Detayı')

  const loadStudent = useCallback(async () => {
    if (!studentId) {
      return
    }

    setLoading(true)
    setError(null)

    const result = await fetchStudentDetail(studentId)

    if (result.error) {
      setStudent(null)
      setError(result.error)
      setLoading(false)
      return
    }

    setStudent(result.data ?? null)
    setLoading(false)
  }, [studentId])

  useEffect(() => {
    async function loadReferences() {
      const [studentResult, registrationResult] = await Promise.all([
        fetchStudentReferences(),
        fetchRegistrationReferences(),
      ])

      if (studentResult.data) {
        setReferences(studentResult.data)
      }

      if (registrationResult.data) {
        setRegistrationReferences(registrationResult.data)
      }
    }

    void loadReferences()
    void loadStudent()
  }, [loadStudent])

  async function handleSaveStudent(
    values: StudentFormValues,
    editingStudent?: StudentRecord | null,
  ) {
    setSaving(true)
    const result = await saveStudent(values, auth, editingStudent)
    setSaving(false)

    if (result.error) {
      return result
    }

    await loadStudent()
    return result
  }

  async function handleSaveRegistration(
    values: RegistrationFormValues,
    editingRegistration?: RegistrationRecord | null,
    options?: RegistrationSaveOptions,
  ) {
    setSaving(true)
    const result = await saveRegistration(
      values,
      auth,
      editingRegistration,
      options,
    )
    setSaving(false)

    if (result.error) {
      return result
    }

    await loadStudent()
    return result
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-6 text-sm font-medium text-neutral-600 shadow-sm">
        Öğrenci detayı yükleniyor...
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="space-y-4">
        <Link
          to="/students"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Öğrenci listesine dön
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error ?? 'Öğrenci detayı bulunamadı.'}
        </div>
      </div>
    )
  }

  const parent = getStudentParent(student)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/students"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Öğrenci listesine dön
          </Link>
          <p className="mt-5 text-sm font-medium text-emerald-700">
            Öğrenci Detayı
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-950 sm:text-3xl">
            {student.full_name}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            {parent?.full_name ?? 'Veli bilgisi yok'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            <UserPen className="h-4 w-4" aria-hidden="true" />
            Öğrenci Düzenle
          </button>
          {parent ? (
            <Link
              to={`/parents/${parent.id}`}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              <UsersRound className="h-4 w-4" aria-hidden="true" />
              Veliye Git
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => setIsRegistrationFormOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            <FilePlus2 className="h-4 w-4" aria-hidden="true" />
            Kayıt Oluştur
          </button>
          <a
            href="#student-notes"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            <NotebookPen className="h-4 w-4" aria-hidden="true" />
            Not Ekle
          </a>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DetailField label="Yaş" value={student.age} />
        <DetailField label="Doğum tarihi" value={student.birth_date} />
        <DetailField label="Okul" value={student.school} />
        <DetailField
          label="Oluşturulma"
          value={formatNullableDateTime(student.created_at)}
        />
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-neutral-950">
          Veli Bilgisi
        </h2>
        {parent ? (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <DetailField label="Veli adı" value={parent.full_name} />
            <DetailField label="Telefon" value={parent.phone} />
            <DetailField label="Email" value={parent.email} />
          </div>
        ) : (
          <p className="mt-4 text-sm text-neutral-500">Veli bilgisi yok.</p>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-950">
            Program Kayıtları
          </h2>
          <div className="mt-4 space-y-3">
            {student.registrations && student.registrations.length > 0 ? (
              student.registrations.map((registration) => {
                const program = normalizeRelation(registration.program)

                return (
                  <Link
                    key={registration.id}
                    to={`/registrations/${registration.id}`}
                    className="block rounded-lg border border-neutral-200 p-3 hover:bg-neutral-50"
                  >
                    <p className="font-semibold text-neutral-950">
                      {program?.name ?? 'Program yok'}
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">
                      {registration.status
                        ? registrationStatusLabels[registration.status]
                        : '-'}{' '}
                      · {registration.registration_date ?? '-'}
                    </p>
                  </Link>
                )
              })
            ) : (
              <p className="text-sm text-neutral-500">Kayıt bulunmuyor.</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-950">
            Ödeme Özeti
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <DetailField
              label="Toplam ödeme"
              value={formatCurrency(student.total_payment_amount)}
            />
            <DetailField
              label="Kalan ödeme"
              value={formatCurrency(student.remaining_payment_amount)}
            />
          </div>
          <div className="mt-4 space-y-3">
            {student.payments && student.payments.length > 0 ? (
              student.payments.map((payment) => (
                <Link
                  key={payment.id}
                  to={`/payments/${payment.id}`}
                  className="rounded-lg border border-neutral-200 p-3"
                >
                  <p className="font-semibold text-neutral-950">
                    {formatCurrency(Number(payment.total_amount ?? 0))}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Kalan {formatCurrency(Number(payment.remaining_amount ?? 0))}{' '}
                    ·{' '}
                    {payment.payment_status
                      ? paymentStatusLabels[payment.payment_status]
                      : '-'}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-neutral-500">Ödeme bulunmuyor.</p>
            )}
          </div>
        </div>
      </section>

      <div id="student-notes">
        <NotesSection entityId={student.id} entityType="student" />
      </div>

      <StudentForm
        editingStudent={student}
        isOpen={isFormOpen}
        references={references}
        saving={saving}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSaveStudent}
      />

      <RegistrationForm
        editingRegistration={null}
        initialValues={{
          parent_id: student.parent_id ?? undefined,
          student_id: student.id,
        }}
        isAdmin={isAdmin}
        isOpen={isRegistrationFormOpen}
        references={registrationReferences}
        saving={saving}
        onClose={() => setIsRegistrationFormOpen(false)}
        onSubmit={handleSaveRegistration}
      />
    </div>
  )
}
