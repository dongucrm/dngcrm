import { Plus, RefreshCw, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { PaymentInstallment } from '../types/database'
import { CollectPaymentModal } from '../features/payments/components/CollectPaymentModal'
import { InstallmentsTable } from '../features/payments/components/InstallmentsTable'
import { PaymentCard } from '../features/payments/components/PaymentCard'
import { PaymentFilters } from '../features/payments/components/PaymentFilters'
import { PaymentForm } from '../features/payments/components/PaymentForm'
import { PaymentsTable } from '../features/payments/components/PaymentsTable'
import { emptyPaymentFilters } from '../features/payments/constants'
import {
  buildPaymentWhatsAppMessage,
  collectPayment,
  fetchPaymentReferences,
  fetchPayments,
  getPaymentParentRecord,
  savePayment,
} from '../features/payments/services/paymentService'
import type {
  CollectPaymentValues,
  PaymentFiltersState,
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
import { useAuth } from '../hooks/useAuth'
import { usePageTitle } from '../hooks/usePageTitle'
import { getWhatsAppUrl } from '../utils/phone'

const emptyReferences: PaymentReferences = {
  registrations: [],
  whatsappTemplates: [],
}

const emptyTaskReferences: TaskReferences = {
  leads: [],
  parents: [],
  profiles: [],
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

export function PaymentsPage() {
  usePageTitle('Ödemeler')

  const { isAdmin, isSales, user } = useAuth()
  const auth = useMemo(
    () => ({
      isAdmin,
      isSales,
      userId: user?.id ?? null,
    }),
    [isAdmin, isSales, user?.id],
  )
  const [filters, setFilters] = useState<PaymentFiltersState>({
    ...emptyPaymentFilters,
  })
  const [references, setReferences] = useState<PaymentReferences>(emptyReferences)
  const [taskReferences, setTaskReferences] =
    useState<TaskReferences>(emptyTaskReferences)
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(
    null,
  )
  const [selectedInstallment, setSelectedInstallment] =
    useState<PaymentInstallment | null>(null)
  const [installmentPreview, setInstallmentPreview] =
    useState<PaymentRecord | null>(null)
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isCollectOpen, setIsCollectOpen] = useState(false)
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [referencesLoading, setReferencesLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPayments = useCallback(async () => {
    setLoading(true)
    setError(null)

    const result = await fetchPayments(filters)

    if (result.error) {
      setPayments([])
      setError(result.error)
      setLoading(false)
      return
    }

    setPayments(result.data ?? [])
    setLoading(false)
  }, [filters])

  useEffect(() => {
    async function loadReferences() {
      setReferencesLoading(true)
      const [paymentResult, taskResult] = await Promise.all([
        fetchPaymentReferences(),
        fetchTaskReferences(auth),
      ])

      if (paymentResult.data) {
        setReferences(paymentResult.data)
      }

      if (paymentResult.error) {
        setError(paymentResult.error)
      }

      if (taskResult.data) {
        setTaskReferences(taskResult.data)
      }

      setReferencesLoading(false)
    }

    void loadReferences()
  }, [auth])

  useEffect(() => {
    void loadPayments()
  }, [loadPayments])

  function openCreateModal() {
    setSelectedPayment(null)
    setIsFormOpen(true)
  }

  function openEditModal(payment: PaymentRecord) {
    setSelectedPayment(payment)
    setIsFormOpen(true)
  }

  function openCollectModal(payment: PaymentRecord) {
    const installment = getFirstCollectableInstallment(payment)

    if (!installment) {
      setError('Tahsil edilebilir taksit bulunamadı.')
      return
    }

    setSelectedPayment(payment)
    setSelectedInstallment(installment)
    setIsCollectOpen(true)
  }

  function openTaskModal(payment: PaymentRecord) {
    setSelectedPayment(payment)
    setIsTaskFormOpen(true)
  }

  function getPaymentWhatsAppUrl(payment: PaymentRecord) {
    const template = references.whatsappTemplates.find(
      (item) => item.id === selectedTemplateId,
    )
    const parent = getPaymentParentRecord(payment)

    return getWhatsAppUrl(
      parent?.phone ?? '',
      buildPaymentWhatsAppMessage(template?.message, payment),
    )
  }

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

    await loadPayments()
    return result
  }

  async function handleCollectPayment(
    payment: PaymentRecord,
    values: CollectPaymentValues,
  ) {
    setSaving(true)
    const result = await collectPayment(payment, values, auth)
    setSaving(false)

    if (result.error) {
      return result
    }

    await loadPayments()
    return result
  }

  async function handleSaveTask(values: TaskFormValues) {
    setSaving(true)
    const result = await saveTask(values, auth)
    setSaving(false)

    if (result.error) {
      return result
    }

    setIsTaskFormOpen(false)
    return result
  }

  const isBusy = loading || referencesLoading
  const selectedParent = selectedPayment
    ? getPaymentParentRecord(selectedPayment)
    : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">Döngü CRM</p>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-950 sm:text-3xl">
            Ödemeler
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Ödeme planlarını, taksitleri ve tahsilat durumlarını takip edin.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => void loadPayments()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Yenile
          </button>
          <button
            type="button"
            disabled={!isAdmin}
            onClick={openCreateModal}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Yeni Ödeme Planı
          </button>
        </div>
      </div>

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
            {references.whatsappTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.title}
              </option>
            ))}
          </select>
        </label>
      </section>

      <PaymentFilters
        filters={filters}
        references={references}
        onChange={setFilters}
        onReset={() => setFilters({ ...emptyPaymentFilters })}
      />

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {isBusy ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-6 text-sm font-medium text-neutral-600 shadow-sm">
          Ödeme listesi yükleniyor...
        </div>
      ) : payments.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-950">
            Ödeme bulunamadı
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Filtreleri değiştirin veya yeni ödeme planı oluşturun.
          </p>
        </div>
      ) : (
        <>
          <PaymentsTable
            canManage={isAdmin}
            payments={payments}
            onCollect={openCollectModal}
            onCreateTask={openTaskModal}
            onEdit={openEditModal}
            onShowInstallments={setInstallmentPreview}
            onWhatsApp={getPaymentWhatsAppUrl}
          />
          <div className="grid gap-3 xl:hidden">
            {payments.map((payment) => (
              <PaymentCard
                key={payment.id}
                canManage={isAdmin}
                payment={payment}
                onCollect={openCollectModal}
                onCreateTask={openTaskModal}
                onEdit={openEditModal}
                onShowInstallments={setInstallmentPreview}
                onWhatsApp={getPaymentWhatsAppUrl}
              />
            ))}
          </div>
        </>
      )}

      {installmentPreview ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-neutral-950/40 px-4 py-6">
          <section className="w-full max-w-4xl rounded-lg border border-neutral-200 bg-white p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-neutral-950">
                Taksitler
              </h2>
              <button
                type="button"
                aria-label="Kapat"
                onClick={() => setInstallmentPreview(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <InstallmentsTable
              canCollect={isAdmin}
              installments={installmentPreview.installments ?? []}
              onCollect={(installment) => {
                setSelectedPayment(installmentPreview)
                setSelectedInstallment(installment)
                setInstallmentPreview(null)
                setIsCollectOpen(true)
              }}
            />
          </section>
        </div>
      ) : null}

      <PaymentForm
        editingPayment={selectedPayment}
        isAdmin={isAdmin}
        isOpen={isFormOpen}
        references={references}
        saving={saving}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSavePayment}
      />

      <CollectPaymentModal
        installment={selectedInstallment}
        isOpen={isCollectOpen}
        payment={selectedPayment}
        saving={saving}
        onClose={() => setIsCollectOpen(false)}
        onSubmit={handleCollectPayment}
      />

      <TaskForm
        authUserId={user?.id ?? null}
        editingTask={null}
        initialValues={
          selectedParent
            ? createTaskValuesFromParent(selectedParent.id, user?.id)
            : undefined
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
