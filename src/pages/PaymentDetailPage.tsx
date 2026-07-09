import {
  ArrowLeft,
  Banknote,
  ListChecks,
  MessageCircle,
  NotebookPen,
  UserPen,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { PaymentInstallment } from '../types/database'
import { NotesSection } from '../features/notes/components/NotesSection'
import { CollectPaymentModal } from '../features/payments/components/CollectPaymentModal'
import { InstallmentsTable } from '../features/payments/components/InstallmentsTable'
import { PaymentForm } from '../features/payments/components/PaymentForm'
import { PaymentSummary } from '../features/payments/components/PaymentSummary'
import {
  collectPayment,
  fetchPaymentDetail,
  fetchPaymentReferences,
  getPaymentParentRecord,
  getPaymentProgram,
  getPaymentRegistration,
  getPaymentStudent,
  savePayment,
} from '../features/payments/services/paymentService'
import type {
  CollectPaymentValues,
  PaymentFormValues,
  PaymentRecord,
  PaymentReferences,
} from '../features/payments/types'
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
  paymentMethodLabels,
  paymentStatusLabels,
  registrationStatusLabels,
  taskStatusLabels,
} from '../utils/labels'

const emptyPaymentReferences: PaymentReferences = {
  registrations: [],
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

function getFirstCollectableInstallment(payment: PaymentRecord) {
  return (
    payment.installments?.find(
      (installment) =>
        installment.status !== 'odendi' &&
        installment.status !== 'iptal' &&
        Number(installment.remaining_amount ?? 0) > 0,
    ) ?? null
  )
}

export function PaymentDetailPage() {
  const { paymentId } = useParams()
  const { isAdmin, isSales, user } = useAuth()
  const auth = useMemo(
    () => ({
      isAdmin,
      isSales,
      userId: user?.id ?? null,
    }),
    [isAdmin, isSales, user?.id],
  )
  const [payment, setPayment] = useState<PaymentRecord | null>(null)
  const [paymentReferences, setPaymentReferences] =
    useState<PaymentReferences>(emptyPaymentReferences)
  const [taskReferences, setTaskReferences] =
    useState<TaskReferences>(emptyTaskReferences)
  const [selectedInstallment, setSelectedInstallment] =
    useState<PaymentInstallment | null>(null)
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false)
  const [isCollectOpen, setIsCollectOpen] = useState(false)
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { openWhatsAppMessage } = useWhatsAppMessage()

  usePageTitle(payment ? 'Ödeme Detayı' : 'Ödeme Detayı')

  const loadPayment = useCallback(async () => {
    if (!paymentId) {
      return
    }

    setLoading(true)
    setError(null)

    const result = await fetchPaymentDetail(paymentId)

    if (result.error) {
      setPayment(null)
      setError(result.error)
      setLoading(false)
      return
    }

    setPayment(result.data ?? null)
    setLoading(false)
  }, [paymentId])

  useEffect(() => {
    async function loadReferences() {
      const [paymentResult, taskResult] = await Promise.all([
        fetchPaymentReferences(),
        fetchTaskReferences(auth),
      ])

      if (paymentResult.data) {
        setPaymentReferences(paymentResult.data)
      }

      if (taskResult.data) {
        setTaskReferences(taskResult.data)
      }
    }

    void loadReferences()
    void loadPayment()
  }, [auth, loadPayment])

  async function handleSavePayment(
    values: PaymentFormValues,
    editingPayment?: PaymentRecord | null,
  ) {
    setSaving(true)
    const result = await savePayment(values, auth, editingPayment)
    setSaving(false)

    if (result.error) {
      return result
    }

    await loadPayment()
    return result
  }

  async function handleCollectPayment(
    currentPayment: PaymentRecord,
    values: CollectPaymentValues,
  ) {
    setSaving(true)
    const result = await collectPayment(currentPayment, values, auth)
    setSaving(false)

    if (result.error) {
      return result
    }

    await loadPayment()
    return result
  }

  async function handleSaveTask(values: TaskFormValues) {
    setSaving(true)
    const result = await saveTask(values, auth)
    setSaving(false)

    if (result.error) {
      return result
    }

    await loadPayment()
    setIsTaskFormOpen(false)
    return result
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-6 text-sm font-medium text-neutral-600 shadow-sm">
        Ödeme detayı yükleniyor...
      </div>
    )
  }

  if (error || !payment) {
    return (
      <div className="space-y-4">
        <Link
          to="/payments"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Ödeme listesine dön
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error ?? 'Ödeme detayı bulunamadı.'}
        </div>
      </div>
    )
  }

  const parent = getPaymentParentRecord(payment)
  const student = getPaymentStudent(payment)
  const program = getPaymentProgram(payment)
  const registration = getPaymentRegistration(payment)
  const paidInstallments = payment.installments?.filter(
    (installment) => installment.status === 'odendi',
  ).length
  const overdueInstallments = payment.installments?.filter(
    (installment) => installment.status === 'gecikti',
  ).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/payments"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Ödeme listesine dön
          </Link>
          <p className="mt-5 text-sm font-medium text-emerald-700">
            Ödeme Detayı
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-950 sm:text-3xl">
            {parent?.full_name ?? 'Veli yok'} · {program?.name ?? 'Program yok'}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            {student?.full_name ?? 'Öğrenci yok'} ·{' '}
            {payment.payment_status
              ? paymentStatusLabels[payment.payment_status]
              : '-'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!isAdmin}
            onClick={() => {
              setSelectedInstallment(getFirstCollectableInstallment(payment))
              setIsCollectOpen(true)
            }}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
          >
            <Banknote className="h-4 w-4" aria-hidden="true" />
            Tahsilat
          </button>
          <button
            type="button"
            disabled={!isAdmin}
            onClick={() => setIsPaymentFormOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
          >
            <UserPen className="h-4 w-4" aria-hidden="true" />
            Düzenle
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
            href="#payment-notes"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            <NotebookPen className="h-4 w-4" aria-hidden="true" />
            Not
          </a>
          <button
            type="button"
            onClick={() =>
              parent &&
              openWhatsAppMessage({
                defaultCategory: 'odeme',
                entityId: payment.id,
                entityType: 'payment',
                name: parent.full_name,
                phone: parent.phone,
                variables: {
                  en_yakin_odeme_tarihi: payment.nearest_due_date,
                  geciken_tutar: formatCurrency(payment.overdue_amount),
                  kalan_tutar: formatCurrency(
                    Number(payment.remaining_amount ?? 0),
                  ),
                  odenen_tutar: formatCurrency(Number(payment.paid_amount ?? 0)),
                  ogrenci_adi: student?.full_name,
                  program_adi: program?.name,
                  toplam_tutar: formatCurrency(Number(payment.total_amount ?? 0)),
                  veli_adi: parent.full_name,
                },
              })
            }
            disabled={!parent?.phone}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 aria-disabled:pointer-events-none aria-disabled:opacity-50"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            WhatsApp
          </button>
        </div>
      </div>

      <PaymentSummary
        items={[
          { label: 'Toplam tutar', value: formatCurrency(payment.total_amount) },
          { label: 'Toplam ödenen', value: formatCurrency(payment.paid_amount) },
          { label: 'Kalan tutar', value: formatCurrency(payment.remaining_amount) },
          { label: 'Toplam taksit', value: payment.installment_count ?? 0 },
          { label: 'Ödenen taksit', value: paidInstallments ?? 0 },
          { label: 'Geciken taksit', value: overdueInstallments ?? 0 },
          { label: 'En yakın ödeme', value: payment.nearest_due_date ?? '-' },
          { label: 'Geciken tutar', value: formatCurrency(payment.overdue_amount) },
        ]}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DetailField label="Veli" value={parent?.full_name} />
        <DetailField label="Öğrenci" value={student?.full_name} />
        <DetailField label="Program" value={program?.name} />
        <DetailField
          label="Kayıt"
          value={
            registration?.status
              ? registrationStatusLabels[registration.status]
              : registration?.id
          }
        />
        <DetailField
          label="Ödeme yöntemi"
          value={
            payment.payment_method
              ? paymentMethodLabels[payment.payment_method]
              : null
          }
        />
        <DetailField label="Ödeme tarihi" value={payment.payment_date} />
        <DetailField
          label="Oluşturulma"
          value={formatNullableDateTime(payment.created_at)}
        />
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
          to={registration ? `/registrations/${registration.id}` : '#'}
          className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm hover:bg-neutral-50"
        >
          <h2 className="text-base font-semibold text-neutral-950">Kayıt</h2>
          <p className="mt-2 text-sm text-neutral-600">
            {registration?.registration_date ?? '-'} ·{' '}
            {formatCurrency(registration?.final_price)}
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

      <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-neutral-950">
          Taksit Listesi
        </h2>
        <InstallmentsTable
          canCollect={isAdmin}
          installments={payment.installments ?? []}
          onCollect={(installment) => {
            setSelectedInstallment(installment)
            setIsCollectOpen(true)
          }}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-950">Görevler</h2>
          <div className="mt-4 divide-y divide-neutral-200">
            {payment.tasks && payment.tasks.length > 0 ? (
              payment.tasks.map((task) => (
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
              <p className="text-sm text-neutral-500">Görev bulunmuyor.</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-950">Notlar</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-700">
            {payment.notes || '-'}
          </p>
        </div>
      </section>

      <div id="payment-notes">
        <NotesSection entityId={payment.id} entityType="payment" />
      </div>

      <PaymentForm
        editingPayment={payment}
        isAdmin={isAdmin}
        isOpen={isPaymentFormOpen}
        references={paymentReferences}
        saving={saving}
        onClose={() => setIsPaymentFormOpen(false)}
        onSubmit={handleSavePayment}
      />

      <CollectPaymentModal
        installment={selectedInstallment}
        isOpen={isCollectOpen}
        payment={payment}
        saving={saving}
        onClose={() => setIsCollectOpen(false)}
        onSubmit={handleCollectPayment}
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
