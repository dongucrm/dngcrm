import {
  ArrowLeft,
  CreditCard,
  ListChecks,
  MessageCircle,
  NotebookPen,
  UserPen,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { NotesSection } from '../features/notes/components/NotesSection'
import { RegistrationForm } from '../features/registrations/components/RegistrationForm'
import {
  fetchRegistrationDetail,
  fetchRegistrationReferences,
  getRegistrationParent,
  getRegistrationProgram,
  getRegistrationStudent,
  saveRegistration,
} from '../features/registrations/services/registrationService'
import type {
  RegistrationFormValues,
  RegistrationRecord,
  RegistrationReferences,
  RegistrationSaveOptions,
} from '../features/registrations/types'
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
import { formatNullableDateTime } from '../utils/date'
import {
  paymentStatusLabels,
  registrationStatusLabels,
  taskStatusLabels,
} from '../utils/labels'
import { getWhatsAppUrl } from '../utils/phone'

const emptyRegistrationReferences: RegistrationReferences = {
  parents: [],
  programs: [],
  students: [],
  whatsappTemplates: [],
}

const emptyTaskReferences: TaskReferences = {
  leads: [],
  parents: [],
  profiles: [],
}

function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat('tr-TR', {
    currency: 'TRY',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(Number(value ?? 0))
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

function buildWhatsAppMessage(
  template: string | undefined,
  registration: RegistrationRecord,
) {
  if (!template) {
    return undefined
  }

  const parent = getRegistrationParent(registration)
  const student = getRegistrationStudent(registration)
  const program = getRegistrationProgram(registration)
  const status = registration.status
    ? registrationStatusLabels[registration.status]
    : ''
  const replacements = {
    kalan_odeme: formatCurrency(registration.remaining_amount),
    kayit_durumu: status,
    net_fiyat: formatCurrency(registration.final_price),
    ogrenci_adi: student?.full_name ?? '',
    program_adi: program?.name ?? '',
    veli_adi: parent?.full_name ?? '',
  }

  return Object.entries(replacements).reduce(
    (message, [key, value]) =>
      message.replaceAll(`{{${key}}}`, value).replaceAll(`{${key}}`, value),
    template,
  )
}

export function RegistrationDetailPage() {
  const { registrationId } = useParams()
  const { isAdmin, isSales, user } = useAuth()
  const auth = useMemo(
    () => ({
      isAdmin,
      isSales,
      userId: user?.id ?? null,
    }),
    [isAdmin, isSales, user?.id],
  )
  const [registration, setRegistration] = useState<RegistrationRecord | null>(
    null,
  )
  const [registrationReferences, setRegistrationReferences] =
    useState<RegistrationReferences>(emptyRegistrationReferences)
  const [taskReferences, setTaskReferences] =
    useState<TaskReferences>(emptyTaskReferences)
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [isRegistrationFormOpen, setIsRegistrationFormOpen] = useState(false)
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  usePageTitle(
    registration ? `${registration.id.slice(0, 8)} Kayıt Detayı` : 'Kayıt Detayı',
  )

  const loadRegistration = useCallback(async () => {
    if (!registrationId) {
      return
    }

    setLoading(true)
    setError(null)

    const result = await fetchRegistrationDetail(registrationId)

    if (result.error) {
      setRegistration(null)
      setError(result.error)
      setLoading(false)
      return
    }

    setRegistration(result.data ?? null)
    setLoading(false)
  }, [registrationId])

  useEffect(() => {
    async function loadReferences() {
      const [registrationResult, taskResult] = await Promise.all([
        fetchRegistrationReferences(),
        fetchTaskReferences(auth),
      ])

      if (registrationResult.data) {
        setRegistrationReferences(registrationResult.data)
      }

      if (taskResult.data) {
        setTaskReferences(taskResult.data)
      }
    }

    void loadReferences()
    void loadRegistration()
  }, [auth, loadRegistration])

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

    await loadRegistration()
    return result
  }

  async function handleSaveTask(values: TaskFormValues) {
    setSaving(true)
    const result = await saveTask(values, auth)
    setSaving(false)

    if (result.error) {
      return result
    }

    await loadRegistration()
    setIsTaskFormOpen(false)
    return result
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-6 text-sm font-medium text-neutral-600 shadow-sm">
        Kayıt detayı yükleniyor...
      </div>
    )
  }

  if (error || !registration) {
    return (
      <div className="space-y-4">
        <Link
          to="/registrations"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kayıt listesine dön
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error ?? 'Kayıt detayı bulunamadı.'}
        </div>
      </div>
    )
  }

  const parent = getRegistrationParent(registration)
  const student = getRegistrationStudent(registration)
  const program = getRegistrationProgram(registration)
  const selectedTemplate = registrationReferences.whatsappTemplates.find(
    (template) => template.id === selectedTemplateId,
  )
  const whatsappUrl = getWhatsAppUrl(
    parent?.phone ?? '',
    buildWhatsAppMessage(selectedTemplate?.message, registration),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/registrations"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Kayıt listesine dön
          </Link>
          <p className="mt-5 text-sm font-medium text-emerald-700">
            Kayıt Detayı
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-950 sm:text-3xl">
            {student?.full_name ?? 'Öğrenci yok'} · {program?.name ?? 'Program yok'}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            {parent?.full_name ?? 'Veli yok'} ·{' '}
            {registration.status
              ? registrationStatusLabels[registration.status]
              : '-'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIsRegistrationFormOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            <UserPen className="h-4 w-4" aria-hidden="true" />
            Düzenle
          </button>
          <button
            type="button"
            onClick={() => setNotice('Ödeme ekleme modülü sonraki adımda bağlanacak.')}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            <CreditCard className="h-4 w-4" aria-hidden="true" />
            Ödeme
          </button>
          <button
            type="button"
            onClick={() => setIsTaskFormOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            <ListChecks className="h-4 w-4" aria-hidden="true" />
            Görev
          </button>
          <a
            href="#registration-notes"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            <NotebookPen className="h-4 w-4" aria-hidden="true" />
            Not
          </a>
          <a
            href={whatsappUrl ?? undefined}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!whatsappUrl}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 aria-disabled:pointer-events-none aria-disabled:opacity-50"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            WhatsApp
          </a>
        </div>
      </div>

      {notice ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
          {notice}
        </div>
      ) : null}

      <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <label className="block max-w-md">
          <span className="text-sm font-medium text-neutral-700">
            WhatsApp şablonu
          </span>
          <select
            value={selectedTemplateId}
            onChange={(event) => setSelectedTemplateId(event.target.value)}
            className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="">Şablon seçilmedi</option>
            {registrationReferences.whatsappTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.title}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DetailField label="Veli" value={parent?.full_name} />
        <DetailField label="Öğrenci" value={student?.full_name} />
        <DetailField label="Program" value={program?.name} />
        <DetailField label="Kayıt tarihi" value={registration.registration_date} />
        <DetailField label="Toplam fiyat" value={formatCurrency(registration.total_price)} />
        <DetailField label="İndirim" value={formatCurrency(registration.discount_amount)} />
        <DetailField label="Net fiyat" value={formatCurrency(registration.final_price)} />
        <DetailField label="Kalan ödeme" value={formatCurrency(registration.remaining_amount)} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Link
          to={parent ? `/parents/${parent.id}` : '#'}
          className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm hover:bg-neutral-50"
        >
          <h2 className="text-base font-semibold text-neutral-950">Veli</h2>
          <p className="mt-2 text-sm text-neutral-600">
            {parent?.full_name ?? '-'} · {parent?.phone ?? '-'}
          </p>
        </Link>
        <Link
          to={student ? `/students/${student.id}` : '#'}
          className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm hover:bg-neutral-50"
        >
          <h2 className="text-base font-semibold text-neutral-950">Öğrenci</h2>
          <p className="mt-2 text-sm text-neutral-600">
            {student?.full_name ?? '-'} · {student?.school ?? 'Okul yok'}
          </p>
        </Link>
        <Link
          to={program ? `/programs/${program.id}` : '#'}
          className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm hover:bg-neutral-50"
        >
          <h2 className="text-base font-semibold text-neutral-950">Program</h2>
          <p className="mt-2 text-sm text-neutral-600">
            {program?.name ?? '-'} · {formatCurrency(program?.price)}
          </p>
        </Link>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-950">
            Ödeme Listesi
          </h2>
          <div className="mt-4 divide-y divide-neutral-200">
            {registration.payments && registration.payments.length > 0 ? (
              registration.payments.map((payment) => (
                <article key={payment.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-sm font-semibold text-neutral-950">
                    {formatCurrency(payment.total_amount)}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Kalan {formatCurrency(payment.remaining_amount)} ·{' '}
                    {payment.payment_status
                      ? paymentStatusLabels[payment.payment_status]
                      : '-'}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-sm text-neutral-500">Ödeme bulunmuyor.</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-950">Görevler</h2>
          <div className="mt-4 divide-y divide-neutral-200">
            {registration.tasks && registration.tasks.length > 0 ? (
              registration.tasks.map((task) => (
                <article key={task.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-sm font-semibold text-neutral-950">
                    {task.title}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {formatNullableDateTime(task.due_date)} ·{' '}
                    {task.status ? taskStatusLabels[task.status] : '-'}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-sm text-neutral-500">
                Bu kayda bağlı veli görevleri bulunmuyor.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-neutral-950">Notlar</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-700">
          {registration.notes || '-'}
        </p>
      </section>

      <div id="registration-notes">
        <NotesSection entityId={registration.id} entityType="registration" />
      </div>

      <RegistrationForm
        editingRegistration={registration}
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
        initialValues={
          parent ? createTaskValuesFromParent(parent.id, user?.id) : undefined
        }
        isAdmin={isAdmin}
        isOpen={isTaskFormOpen}
        references={taskReferences}
        saving={saving}
        onClose={() => setIsTaskFormOpen(false)}
        onSubmit={handleSaveTask}
      />
    </div>
  )
}
