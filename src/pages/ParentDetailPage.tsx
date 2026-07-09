import {
  ArrowLeft,
  CreditCard,
  GraduationCap,
  ListChecks,
  MessageCircle,
  PhoneCall,
  PlusCircle,
  UserPen,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CallLogForm } from '../features/calls/components/CallLogForm'
import {
  fetchCallReferences,
  saveCallLog,
} from '../features/calls/services/callLogService'
import type {
  CallLogFormValues,
  CallReferences,
} from '../features/calls/types'
import { NotesSection } from '../features/notes/components/NotesSection'
import { ParentForm } from '../features/parents/components/ParentForm'
import {
  fetchParentDetail,
  fetchParentReferences,
  saveParent,
} from '../features/parents/services/parentService'
import type {
  ParentFormValues,
  ParentRecord,
  ParentReferences,
} from '../features/parents/types'
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
import { useWhatsAppMessage } from '../features/whatsapp/providers/WhatsAppMessageContext'
import { useAuth } from '../hooks/useAuth'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatNullableDateTime } from '../utils/date'
import {
  callStatusLabels,
  leadPriorityLabels,
  paymentStatusLabels,
  registrationStatusLabels,
  taskStatusLabels,
} from '../utils/labels'
import { formatPhoneForDisplay } from '../utils/phone'

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

const emptyCallReferences: CallReferences = {
  leads: [],
  parents: [],
  profiles: [],
  programs: [],
  sources: [],
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

export function ParentDetailPage() {
  const { parentId } = useParams()
  const { isAdmin, isSales, user } = useAuth()
  const auth = useMemo(
    () => ({
      isAdmin,
      isSales,
      userId: user?.id ?? null,
    }),
    [isAdmin, isSales, user?.id],
  )
  const [parent, setParent] = useState<ParentRecord | null>(null)
  const [parentReferences, setParentReferences] = useState<ParentReferences>(
    emptyParentReferences,
  )
  const [studentReferences, setStudentReferences] =
    useState<StudentReferences>(emptyStudentReferences)
  const [taskReferences, setTaskReferences] =
    useState<TaskReferences>(emptyTaskReferences)
  const [callReferences, setCallReferences] =
    useState<CallReferences>(emptyCallReferences)
  const [registrationReferences, setRegistrationReferences] =
    useState<RegistrationReferences>(emptyRegistrationReferences)
  const [isParentFormOpen, setIsParentFormOpen] = useState(false)
  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false)
  const [isRegistrationFormOpen, setIsRegistrationFormOpen] = useState(false)
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [isCallFormOpen, setIsCallFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { openWhatsAppMessage } = useWhatsAppMessage()

  usePageTitle(parent ? `${parent.full_name} Veli Detayı` : 'Veli Detayı')

  const loadParent = useCallback(async () => {
    if (!parentId) {
      return
    }

    setLoading(true)
    setError(null)

    const result = await fetchParentDetail(parentId)

    if (result.error) {
      setParent(null)
      setError(result.error)
      setLoading(false)
      return
    }

    setParent(result.data ?? null)
    setLoading(false)
  }, [parentId])

  useEffect(() => {
    async function loadReferences() {
      const [
        parentResult,
        studentResult,
        taskResult,
        callResult,
        registrationResult,
      ] =
        await Promise.all([
          fetchParentReferences(),
          fetchStudentReferences(),
          fetchTaskReferences(auth),
          fetchCallReferences(auth),
          fetchRegistrationReferences(),
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

      if (callResult.data) {
        setCallReferences(callResult.data)
      }

      if (registrationResult.data) {
        setRegistrationReferences(registrationResult.data)
      }
    }

    void loadReferences()
    void loadParent()
  }, [auth, loadParent])

  async function handleSaveParent(
    values: ParentFormValues,
    editingParent?: ParentRecord | null,
  ) {
    setSaving(true)
    const result = await saveParent(values, auth, editingParent)
    setSaving(false)

    if (result.error) {
      return result
    }

    await loadParent()
    return result
  }

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

    await loadParent()
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

    await loadParent()
    return result
  }

  async function handleSaveTask(values: TaskFormValues) {
    setSaving(true)
    const result = await saveTask(values, auth)
    setSaving(false)

    if (result.error) {
      return result
    }

    await loadParent()
    setIsTaskFormOpen(false)
    return result
  }

  async function handleSaveCallLog(values: CallLogFormValues) {
    setSaving(true)
    const result = await saveCallLog(values, auth)
    setSaving(false)

    if (result.error) {
      return result
    }

    await loadParent()
    setIsCallFormOpen(false)
    return result
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-6 text-sm font-medium text-neutral-600 shadow-sm">
        Veli detayı yükleniyor...
      </div>
    )
  }

  if (error || !parent) {
    return (
      <div className="space-y-4">
        <Link
          to="/parents"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Veli listesine dön
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error ?? 'Veli detayı bulunamadı.'}
        </div>
      </div>
    )
  }

  const firstStudent = parent.students?.[0]
  const initialCallParent =
    callReferences.parents.find((callParent) => callParent.id === parent.id) ?? {
      email: parent.email,
      full_name: parent.full_name,
      id: parent.id,
      phone: parent.phone,
    }
  const parentPayments = parent.payments ?? []
  const paidPaymentAmount = parentPayments.reduce(
    (total, payment) => total + Number(payment.paid_amount ?? 0),
    0,
  )
  const today = new Date().toISOString().slice(0, 10)
  const overduePaymentAmount = parentPayments.reduce((total, payment) => {
    const installmentAmount = (payment.installments ?? [])
      .filter((installment) => {
        const dueDate = installment.due_date

        return (
          installment.status !== 'odendi' &&
          installment.status !== 'iptal' &&
          dueDate !== null &&
          dueDate < today
        )
      })
      .reduce(
        (installmentTotal, installment) =>
          installmentTotal + Number(installment.remaining_amount ?? 0),
        0,
      )

    if (installmentAmount > 0) {
      return total + installmentAmount
    }

    if (
      payment.due_date &&
      payment.due_date < today &&
      Number(payment.remaining_amount ?? 0) > 0
    ) {
      return total + Number(payment.remaining_amount ?? 0)
    }

    return total
  }, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/parents"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Veli listesine dön
          </Link>
          <p className="mt-5 text-sm font-medium text-emerald-700">
            Veli Detayı
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-950 sm:text-3xl">
            {parent.full_name}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            {formatPhoneForDisplay(parent.phone)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIsParentFormOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            <UserPen className="h-4 w-4" aria-hidden="true" />
            Veli Düzenle
          </button>
          <button
            type="button"
            onClick={() => setIsStudentFormOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            <GraduationCap className="h-4 w-4" aria-hidden="true" />
            Öğrenci Ekle
          </button>
          <button
            type="button"
            onClick={() => setIsCallFormOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            <PhoneCall className="h-4 w-4" aria-hidden="true" />
            Arama Kaydı
          </button>
          <button
            type="button"
            onClick={() => setIsTaskFormOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            <ListChecks className="h-4 w-4" aria-hidden="true" />
            Görev
          </button>
          <button
            type="button"
            onClick={() =>
              openWhatsAppMessage({
                defaultCategory: 'veli',
                entityId: parent.id,
                entityType: 'parent',
                name: parent.full_name,
                phone: parent.phone,
                variables: {
                  ogrenci_adi: firstStudent?.full_name,
                  ogrenci_yasi: firstStudent?.age,
                  veli_adi: parent.full_name,
                  veli_telefonu: parent.phone,
                },
              })
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            WhatsApp
          </button>
        </div>
      </div>

      <section className="hidden">
        <label className="block max-w-md">
          <span className="text-sm font-medium text-neutral-700">
            WhatsApp şablonu
          </span>
          <select
            value=""
            onChange={() => undefined}
            className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="">Şablon seçilmedi</option>
            {parentReferences.whatsappTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.title}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DetailField label="Telefon" value={parent.phone} />
        <DetailField label="Email" value={parent.email} />
        <DetailField label="Adres" value={parent.address} />
        <DetailField
          label="Oluşturulma"
          value={formatNullableDateTime(parent.created_at)}
        />
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-neutral-950">
          Öğrencileri
        </h2>
        {parent.students && parent.students.length > 0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {parent.students.map((student) => (
              <Link
                key={student.id}
                to={`/students/${student.id}`}
                className="rounded-lg border border-neutral-200 p-4 hover:bg-neutral-50"
              >
                <p className="font-semibold text-neutral-950">
                  {student.full_name}
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  {student.age ? `${student.age} yaş` : 'Yaş yok'} ·{' '}
                  {student.school || 'Okul yok'}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-neutral-500">
            Bu veliye bağlı öğrenci bulunmuyor.
          </p>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-950">
              Kayıtlar
            </h2>
            <button
              type="button"
              onClick={() => setIsRegistrationFormOpen(true)}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              Kayıt Oluştur
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {parent.registrations && parent.registrations.length > 0 ? (
              parent.registrations.map((registration) => {
                const program = normalizeRelation(registration.program)
                const student = normalizeRelation(registration.student)

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
                      {student?.full_name ?? 'Öğrenci yok'} ·{' '}
                      {registration.status
                        ? registrationStatusLabels[registration.status]
                        : '-'}
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
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-950">
              Ödemeler
            </h2>
            <CreditCard className="h-4 w-4 text-neutral-400" aria-hidden="true" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <DetailField
              label="Toplam plan"
              value={formatCurrency(parent.total_payment_amount)}
            />
            <DetailField
              label="Odenen"
              value={formatCurrency(paidPaymentAmount)}
            />
            <DetailField
              label="Kalan"
              value={formatCurrency(parent.remaining_payment_amount)}
            />
            <DetailField
              label="Geciken"
              value={formatCurrency(overduePaymentAmount)}
            />
          </div>
          {overduePaymentAmount > 0 ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              Gecikmis odeme uyarisi: {formatCurrency(overduePaymentAmount)}
            </div>
          ) : null}
          <div className="mt-4 space-y-3">
            {parent.payments && parent.payments.length > 0 ? (
              parent.payments.map((payment) => (
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

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-950">
            Görüşme Geçmişi
          </h2>
          <div className="mt-4 divide-y divide-neutral-200">
            {parent.call_logs && parent.call_logs.length > 0 ? (
              parent.call_logs.map((log) => {
                const logUser = normalizeRelation(log.user)

                return (
                  <article key={log.id} className="py-3 first:pt-0 last:pb-0">
                    <p className="text-sm font-semibold text-neutral-950">
                      {log.call_status
                        ? callStatusLabels[log.call_status]
                        : 'Durum yok'}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {formatNullableDateTime(log.call_date)} ·{' '}
                      {logUser?.full_name ?? 'Personel yok'}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-700">
                      {log.notes || '-'}
                    </p>
                  </article>
                )
              })
            ) : (
              <p className="text-sm text-neutral-500">
                Görüşme kaydı bulunmuyor.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-950">Görevler</h2>
          <div className="mt-4 divide-y divide-neutral-200">
            {parent.tasks && parent.tasks.length > 0 ? (
              parent.tasks.map((task) => (
                <article key={task.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-sm font-semibold text-neutral-950">
                    {task.title}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {formatNullableDateTime(task.due_date)} ·{' '}
                    {task.status ? taskStatusLabels[task.status] : '-'} ·{' '}
                    {task.priority ? leadPriorityLabels[task.priority] : '-'}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-sm text-neutral-500">Görev bulunmuyor.</p>
            )}
          </div>
        </div>
      </section>

      <NotesSection entityId={parent.id} entityType="parent" />

      <ParentForm
        editingParent={parent}
        isOpen={isParentFormOpen}
        saving={saving}
        onClose={() => setIsParentFormOpen(false)}
        onSubmit={handleSaveParent}
      />

      <StudentForm
        editingStudent={null}
        initialParentId={parent.id}
        isOpen={isStudentFormOpen}
        references={studentReferences}
        saving={saving}
        onClose={() => setIsStudentFormOpen(false)}
        onSubmit={handleSaveStudent}
      />

      <RegistrationForm
        editingRegistration={null}
        initialValues={{
          parent_id: parent.id,
          student_id: parent.students?.[0]?.id,
        }}
        isAdmin={isAdmin}
        isOpen={isRegistrationFormOpen}
        references={registrationReferences}
        saving={saving}
        onClose={() => setIsRegistrationFormOpen(false)}
        onSubmit={handleSaveRegistration}
      />

      <TaskForm
        authUserId={user?.id ?? null}
        editingTask={null}
        initialValues={createTaskValuesFromParent(parent.id, user?.id)}
        isAdmin={isAdmin}
        isOpen={isTaskFormOpen}
        references={taskReferences}
        saving={saving}
        onClose={() => setIsTaskFormOpen(false)}
        onSubmit={handleSaveTask}
      />

      <CallLogForm
        authUserId={user?.id ?? null}
        editingLog={null}
        initialLead={null}
        initialParent={initialCallParent}
        isAdmin={isAdmin}
        isOpen={isCallFormOpen}
        references={callReferences}
        saving={saving}
        onClose={() => setIsCallFormOpen(false)}
        onSubmit={handleSaveCallLog}
      />
    </div>
  )
}
