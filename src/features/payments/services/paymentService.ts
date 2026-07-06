import { supabase } from '../../../lib/supabase'
import type {
  PaymentInstallment,
  PaymentInstallmentStatus,
  PaymentStatus,
} from '../../../types/database'
import { getCurrentMonthRange, isToday } from '../../../utils/date'
import type {
  CollectPaymentValues,
  PaymentAuthContext,
  PaymentDashboardMetrics,
  PaymentFiltersState,
  PaymentFormValues,
  PaymentRecord,
  PaymentReferences,
  PaymentRegistration,
  PaymentTask,
} from '../types'

type ServiceResult<T> = {
  data?: T
  error?: string
}

const registrationReferenceSelect = `
  id,
  parent_id,
  student_id,
  program_id,
  status,
  registration_date,
  total_price,
  discount_amount,
  final_price,
  parent:parents (
    id,
    full_name,
    phone,
    email
  ),
  student:students (
    id,
    parent_id,
    full_name,
    age,
    school
  ),
  program:programs (
    id,
    name,
    type,
    price,
    quota,
    is_active
  )
`

const paymentSelect = `
  *,
  parent:parents (
    id,
    full_name,
    phone,
    email
  ),
  registration:registrations (
    ${registrationReferenceSelect}
  ),
  installments:payment_installments (
    *
  )
`

function cleanText(value: string | null | undefined) {
  const trimmedValue = value?.trim()

  return trimmedValue && trimmedValue.length > 0 ? trimmedValue : null
}

function money(value: number | null | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0
  }

  return Math.round(value * 100) / 100
}

function todayDateString() {
  return new Date().toISOString().slice(0, 10)
}

function addMonths(value: string, months: number) {
  const date = new Date(`${value}T00:00:00`)
  date.setMonth(date.getMonth() + months)

  return date.toISOString().slice(0, 10)
}

function isPastDate(value: string | null | undefined) {
  if (!value) {
    return false
  }

  return new Date(`${value}T00:00:00`).getTime() <
    new Date(`${todayDateString()}T00:00:00`).getTime()
}

export function normalizeRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

function normalizeRelationArray<T>(value: T[] | null | undefined) {
  return Array.isArray(value) ? value : []
}

function getInstallmentStatus(
  amount: number,
  paidAmount: number,
  dueDate: string | null | undefined,
): PaymentInstallmentStatus {
  const remainingAmount = money(amount - paidAmount)

  if (remainingAmount <= 0) {
    return 'odendi'
  }

  if (paidAmount > 0) {
    return 'kismi_odendi'
  }

  if (isPastDate(dueDate)) {
    return 'gecikti'
  }

  return 'bekliyor'
}

function enrichInstallment(installment: PaymentInstallment): PaymentInstallment {
  const amount = money(Number(installment.amount ?? 0))
  const paidAmount = money(Number(installment.paid_amount ?? 0))
  const remainingAmount = Math.max(money(amount - paidAmount), 0)

  return {
    ...installment,
    amount,
    paid_amount: paidAmount,
    remaining_amount: remainingAmount,
    status:
      installment.status === 'iptal'
        ? 'iptal'
        : getInstallmentStatus(amount, paidAmount, installment.due_date),
  }
}

function getPaymentStatus(installments: PaymentInstallment[]): PaymentStatus {
  const activeInstallments = installments.filter(
    (installment) => installment.status !== 'iptal',
  )
  const totalAmount = activeInstallments.reduce(
    (total, installment) => total + Number(installment.amount ?? 0),
    0,
  )
  const paidAmount = activeInstallments.reduce(
    (total, installment) => total + Number(installment.paid_amount ?? 0),
    0,
  )
  const hasOverdue = activeInstallments.some(
    (installment) =>
      installment.status === 'gecikti' &&
      Number(installment.remaining_amount ?? 0) > 0,
  )

  if (totalAmount > 0 && paidAmount >= totalAmount) {
    return 'odendi'
  }

  if (hasOverdue) {
    return 'gecikti'
  }

  if (paidAmount > 0) {
    return 'kismi_odendi'
  }

  return 'odenmedi'
}

function enrichPayment(payment: PaymentRecord): PaymentRecord {
  const installments = normalizeRelationArray(payment.installments)
    .map(enrichInstallment)
    .sort(
      (first, second) =>
        Number(first.installment_no ?? 0) - Number(second.installment_no ?? 0),
    )
  const unpaidInstallments = installments.filter(
    (installment) =>
      installment.status !== 'odendi' &&
      installment.status !== 'iptal' &&
      Number(installment.remaining_amount ?? 0) > 0,
  )
  const nearestDueDate =
    unpaidInstallments
      .map((installment) => installment.due_date)
      .filter(Boolean)
      .sort()[0] ?? null
  const overdueAmount = installments
    .filter(
      (installment) =>
        installment.status === 'gecikti' &&
        Number(installment.remaining_amount ?? 0) > 0,
    )
    .reduce(
      (total, installment) => total + Number(installment.remaining_amount ?? 0),
      0,
    )
  const paidInstallmentCount = installments.filter(
    (installment) => installment.status === 'odendi',
  ).length

  return {
    ...payment,
    installments,
    nearest_due_date: nearestDueDate,
    overdue_amount: overdueAmount,
    paid_installment_count: paidInstallmentCount,
  }
}

function distributeInstallments(
  paymentId: string,
  totalAmount: number,
  paidAmount: number,
  installmentCount: number,
  firstDueDate: string,
  notes?: string,
) {
  const count = Math.max(Math.trunc(installmentCount || 1), 1)
  const baseAmount = Math.floor((totalAmount / count) * 100) / 100
  let remainingPlanAmount = money(totalAmount)
  let remainingPaidAmount = money(paidAmount)

  return Array.from({ length: count }, (_, index) => {
    const installmentNo = index + 1
    const amount =
      installmentNo === count ? money(remainingPlanAmount) : money(baseAmount)
    remainingPlanAmount = money(remainingPlanAmount - amount)

    const installmentPaidAmount = Math.min(amount, remainingPaidAmount)
    remainingPaidAmount = money(remainingPaidAmount - installmentPaidAmount)
    const remainingAmount = Math.max(money(amount - installmentPaidAmount), 0)
    const dueDate = addMonths(firstDueDate, index)

    return {
      amount,
      due_date: dueDate,
      installment_no: installmentNo,
      notes: cleanText(notes),
      paid_amount: installmentPaidAmount,
      paid_date: installmentPaidAmount >= amount ? todayDateString() : null,
      payment_id: paymentId,
      remaining_amount: remainingAmount,
      status: getInstallmentStatus(amount, installmentPaidAmount, dueDate),
    }
  })
}

function getPaymentParent(payment: PaymentRecord) {
  return (
    normalizeRelation(payment.parent) ??
    normalizeRelation(payment.registration)?.parent ??
    null
  )
}

export function getPaymentRegistration(payment: PaymentRecord) {
  return normalizeRelation(payment.registration)
}

export function getPaymentParentRecord(payment: PaymentRecord) {
  return normalizeRelation(getPaymentParent(payment))
}

export function getPaymentStudent(payment: PaymentRecord) {
  return normalizeRelation(getPaymentRegistration(payment)?.student)
}

export function getPaymentProgram(payment: PaymentRecord) {
  return normalizeRelation(getPaymentRegistration(payment)?.program)
}

function matchesSearch(payment: PaymentRecord, search: string) {
  if (!search) {
    return true
  }

  const normalizedSearch = search.toLocaleLowerCase('tr')
  const parent = getPaymentParentRecord(payment)
  const student = getPaymentStudent(payment)
  const program = getPaymentProgram(payment)
  const values = [
    parent?.full_name,
    parent?.phone,
    student?.full_name,
    program?.name,
    payment.notes,
  ]

  return values.some((value) =>
    value?.toLocaleLowerCase('tr').includes(normalizedSearch),
  )
}

function matchesDateRange(payment: PaymentRecord, filters: PaymentFiltersState) {
  const dateValue = payment.nearest_due_date ?? payment.due_date

  if (!dateValue) {
    return true
  }

  if (filters.dateFrom && dateValue < filters.dateFrom) {
    return false
  }

  if (filters.dateTo && dateValue > filters.dateTo) {
    return false
  }

  return true
}

function matchesPreset(payment: PaymentRecord, preset: PaymentFiltersState['preset']) {
  if (preset === 'all') {
    return true
  }

  if (preset === 'today') {
    return normalizeRelationArray(payment.installments).some(
      (installment) =>
        isToday(installment.due_date) &&
        Number(installment.remaining_amount ?? 0) > 0,
    )
  }

  return payment.overdue_amount > 0
}

async function fetchParentTasks(parentId: string | null | undefined) {
  if (!parentId) {
    return []
  }

  const { data, error } = await supabase
    .from('tasks')
    .select(
      'id,title,description,related_parent_id,assigned_user_id,created_by,due_date,status,priority,created_at',
    )
    .eq('related_parent_id', parentId)
    .order('due_date', { ascending: true, nullsFirst: false })

  if (error) {
    return []
  }

  return (data ?? []) as PaymentTask[]
}

async function updatePaymentSummary(paymentId: string) {
  const { data, error } = await supabase
    .from('payment_installments')
    .select('*')
    .eq('payment_id', paymentId)

  if (error) {
    return { error: 'Ödeme özeti güncellenemedi.' }
  }

  const installments = ((data ?? []) as PaymentInstallment[]).map(
    enrichInstallment,
  )
  const totalAmount = installments.reduce(
    (total, installment) => total + Number(installment.amount ?? 0),
    0,
  )
  const paidAmount = installments.reduce(
    (total, installment) => total + Number(installment.paid_amount ?? 0),
    0,
  )
  const remainingAmount = Math.max(money(totalAmount - paidAmount), 0)
  const nearestDueDate =
    installments
      .filter(
        (installment) =>
          installment.status !== 'odendi' &&
          installment.status !== 'iptal' &&
          Number(installment.remaining_amount ?? 0) > 0,
      )
      .map((installment) => installment.due_date)
      .filter(Boolean)
      .sort()[0] ?? null
  const paymentStatus = getPaymentStatus(installments)
  const paidInstallments = installments.filter(
    (installment) => installment.status === 'odendi',
  )
  const latestPaidDate =
    paidInstallments
      .map((installment) => installment.paid_date)
      .filter(Boolean)
      .sort()
      .at(-1) ?? null

  const { error: updateError } = await supabase
    .from('payments')
    .update({
      due_date: nearestDueDate,
      paid_amount: paidAmount,
      payment_date: remainingAmount <= 0 ? latestPaidDate : null,
      payment_status: paymentStatus,
      remaining_amount: remainingAmount,
      total_amount: totalAmount,
    })
    .eq('id', paymentId)

  if (updateError) {
    return { error: 'Ödeme özeti güncellenemedi.' }
  }

  await Promise.all(
    installments.map((installment) =>
      supabase
        .from('payment_installments')
        .update({
          paid_amount: installment.paid_amount,
          remaining_amount: installment.remaining_amount,
          status: installment.status,
        })
        .eq('id', installment.id),
    ),
  )

  return { data: null }
}

export async function fetchPaymentReferences(): Promise<
  ServiceResult<PaymentReferences>
> {
  const [registrationResult, templateResult] = await Promise.all([
    supabase
      .from('registrations')
      .select(registrationReferenceSelect)
      .order('created_at', { ascending: false }),
    supabase
      .from('whatsapp_templates')
      .select('*')
      .eq('is_active', true)
      .order('title', { ascending: true }),
  ])

  if (registrationResult.error) {
    return { error: 'Kayıt listesi alınamadı.' }
  }

  return {
    data: {
      registrations: (registrationResult.data ?? []) as PaymentRegistration[],
      whatsappTemplates: templateResult.error ? [] : templateResult.data ?? [],
    },
  }
}

export async function fetchPayments(
  filters: PaymentFiltersState,
): Promise<ServiceResult<PaymentRecord[]>> {
  let query = supabase
    .from('payments')
    .select(paymentSelect)
    .order('created_at', { ascending: false })

  if (filters.status !== 'all') {
    query = query.eq('payment_status', filters.status)
  }

  if (filters.method !== 'all') {
    query = query.eq('payment_method', filters.method)
  }

  const { data, error } = await query

  if (error) {
    return { error: 'Ödeme listesi alınamadı.' }
  }

  const payments = ((data ?? []) as PaymentRecord[])
    .map(enrichPayment)
    .filter((payment) => matchesSearch(payment, filters.search.trim()))
    .filter((payment) =>
      filters.programId === 'all'
        ? true
        : getPaymentProgram(payment)?.id === filters.programId,
    )
    .filter((payment) => matchesDateRange(payment, filters))
    .filter((payment) => matchesPreset(payment, filters.preset))

  return { data: payments }
}

export async function fetchPaymentDetail(
  paymentId: string,
): Promise<ServiceResult<PaymentRecord>> {
  const { data, error } = await supabase
    .from('payments')
    .select(paymentSelect)
    .eq('id', paymentId)
    .maybeSingle()

  if (error || !data) {
    return { error: 'Ödeme detayı alınamadı.' }
  }

  const payment = enrichPayment(data as PaymentRecord)
  const parent = getPaymentParentRecord(payment)
  const tasks = await fetchParentTasks(parent?.id)

  return {
    data: {
      ...payment,
      tasks,
    },
  }
}

export async function savePayment(
  values: PaymentFormValues,
  auth: PaymentAuthContext,
  editingPayment?: PaymentRecord | null,
): Promise<ServiceResult<PaymentRecord>> {
  if (!auth.isAdmin) {
    return { error: 'Ödeme işlemleri yalnızca admin tarafından yapılabilir.' }
  }

  if (!values.registration_id) {
    return { error: 'Kayıt seçmelisiniz.' }
  }

  if (!auth.userId) {
    return { error: 'Oturum kullanıcısı bulunamadı.' }
  }

  const totalAmount = money(Number(values.total_amount ?? 0))
  const paidAmount = money(Number(values.paid_amount ?? 0))
  const remainingAmount = money(totalAmount - paidAmount)
  const installmentCount = Math.max(Number(values.installment_count ?? 1), 1)
  const firstDueDate = values.first_due_date || values.due_date || todayDateString()

  if (totalAmount <= 0) {
    return { error: 'Toplam tutar sıfırdan büyük olmalıdır.' }
  }

  if (paidAmount < 0 || remainingAmount < 0) {
    return { error: 'Kalan tutar negatif olamaz.' }
  }

  const { data: registrationData, error: registrationError } = await supabase
    .from('registrations')
    .select(registrationReferenceSelect)
    .eq('id', values.registration_id)
    .maybeSingle()

  if (registrationError || !registrationData) {
    return { error: 'Kayıt bilgisi alınamadı.' }
  }

  const registration = registrationData as PaymentRegistration
  const payload = {
    installment_count: installmentCount,
    notes: cleanText(values.notes),
    parent_id: registration.parent_id,
    payment_method: values.payment_method ?? null,
    registration_id: values.registration_id,
    total_amount: totalAmount,
  }

  if (editingPayment) {
    const installments = normalizeRelationArray(editingPayment.installments)
    const hasCollection = installments.some(
      (installment) => Number(installment.paid_amount ?? 0) > 0,
    )

    if (
      hasCollection &&
      (installments.length !== installmentCount ||
        money(Number(editingPayment.total_amount ?? 0)) !== totalAmount)
    ) {
      return {
        error:
          'Tahsilat girilmiş ödeme planında toplam tutar veya taksit sayısı değiştirilemez.',
      }
    }

    const { error } = await supabase
      .from('payments')
      .update(payload)
      .eq('id', editingPayment.id)

    if (error) {
      return { error: 'Ödeme güncellenemedi.' }
    }

    if (!hasCollection) {
      await supabase
        .from('payment_installments')
        .delete()
        .eq('payment_id', editingPayment.id)
      const installmentRows = distributeInstallments(
        editingPayment.id,
        totalAmount,
        paidAmount,
        installmentCount,
        firstDueDate,
        values.notes,
      )
      const { error: installmentError } = await supabase
        .from('payment_installments')
        .insert(installmentRows)

      if (installmentError) {
        return { error: 'Taksit planı oluşturulamadı.' }
      }
    }

    const summaryResult = await updatePaymentSummary(editingPayment.id)

    if (summaryResult.error) {
      return { error: summaryResult.error }
    }

    return fetchPaymentDetail(editingPayment.id)
  }

  const { data: paymentData, error: paymentError } = await supabase
    .from('payments')
    .insert({
      ...payload,
      due_date: firstDueDate,
      paid_amount: paidAmount,
      payment_date: remainingAmount <= 0 ? todayDateString() : null,
      payment_status:
        remainingAmount <= 0
          ? ('odendi' satisfies PaymentStatus)
          : paidAmount > 0
            ? ('kismi_odendi' satisfies PaymentStatus)
            : ('odenmedi' satisfies PaymentStatus),
      remaining_amount: remainingAmount,
    })
    .select('id')
    .maybeSingle()

  if (paymentError || !paymentData) {
    return { error: 'Ödeme planı oluşturulamadı.' }
  }

  const installmentRows = distributeInstallments(
    paymentData.id,
    totalAmount,
    paidAmount,
    installmentCount,
    firstDueDate,
    values.notes,
  )
  const { error: installmentError } = await supabase
    .from('payment_installments')
    .insert(installmentRows)

  if (installmentError) {
    return { error: 'Taksit planı oluşturulamadı.' }
  }

  const summaryResult = await updatePaymentSummary(paymentData.id)

  if (summaryResult.error) {
    return { error: summaryResult.error }
  }

  return fetchPaymentDetail(paymentData.id)
}

export async function collectPayment(
  payment: PaymentRecord,
  values: CollectPaymentValues,
  auth: PaymentAuthContext,
): Promise<ServiceResult<PaymentRecord>> {
  if (!auth.isAdmin) {
    return { error: 'Tahsilat yalnızca admin tarafından girilebilir.' }
  }

  const amount = money(values.amount)

  if (!values.installment_id) {
    return { error: 'Taksit seçmelisiniz.' }
  }

  if (amount <= 0) {
    return { error: 'Tahsilat tutarı sıfırdan büyük olmalıdır.' }
  }

  const installment = normalizeRelationArray(payment.installments).find(
    (item) => item.id === values.installment_id,
  )

  if (!installment) {
    return { error: 'Taksit bulunamadı.' }
  }

  const currentRemaining = Number(installment.remaining_amount ?? 0)

  if (amount > currentRemaining) {
    return { error: 'Tahsilat tutarı kalan taksit tutarını aşamaz.' }
  }

  const paidAmount = money(Number(installment.paid_amount ?? 0) + amount)
  const remainingAmount = Math.max(
    money(Number(installment.amount ?? 0) - paidAmount),
    0,
  )
  const paidDate = values.paid_date || todayDateString()
  const status = getInstallmentStatus(
    Number(installment.amount ?? 0),
    paidAmount,
    installment.due_date,
  )

  const { error } = await supabase
    .from('payment_installments')
    .update({
      notes: cleanText(values.notes) ?? installment.notes,
      paid_amount: paidAmount,
      paid_date: remainingAmount <= 0 ? paidDate : installment.paid_date,
      remaining_amount: remainingAmount,
      status,
    })
    .eq('id', installment.id)

  if (error) {
    return { error: 'Tahsilat kaydedilemedi.' }
  }

  const summaryResult = await updatePaymentSummary(payment.id)

  if (summaryResult.error) {
    return { error: summaryResult.error }
  }

  return fetchPaymentDetail(payment.id)
}

export async function fetchPaymentDashboardMetrics(): Promise<PaymentDashboardMetrics> {
  const result = await fetchPayments({
    dateFrom: '',
    dateTo: '',
    method: 'all',
    preset: 'all',
    programId: 'all',
    search: '',
    status: 'all',
  })

  if (result.error) {
    return {
      collectedThisMonth: 0,
      overdueAmount: 0,
      overduePayments: [],
      remainingAmount: 0,
      todayDueCount: 0,
      todayDuePayments: [],
      totalCollected: 0,
      totalExpected: 0,
    }
  }

  const monthRange = getCurrentMonthRange()
  const payments = result.data ?? []
  const totalExpected = payments.reduce(
    (total, payment) => total + Number(payment.total_amount ?? 0),
    0,
  )
  const totalCollected = payments.reduce(
    (total, payment) => total + Number(payment.paid_amount ?? 0),
    0,
  )
  const remainingAmount = payments.reduce(
    (total, payment) => total + Number(payment.remaining_amount ?? 0),
    0,
  )
  const overdueAmount = payments.reduce(
    (total, payment) => total + payment.overdue_amount,
    0,
  )
  const todayDuePayments = payments
    .filter((payment) => matchesPreset(payment, 'today'))
    .slice(0, 5)
  const overduePayments = payments
    .filter((payment) => payment.overdue_amount > 0)
    .slice(0, 5)
  const collectedThisMonth = payments.reduce((total, payment) => {
    const installments = normalizeRelationArray(payment.installments)

    return (
      total +
      installments
        .filter(
          (installment) =>
            installment.paid_date &&
            installment.paid_date >= monthRange.start.slice(0, 10) &&
            installment.paid_date < monthRange.end.slice(0, 10),
        )
        .reduce(
          (installmentTotal, installment) =>
            installmentTotal + Number(installment.paid_amount ?? 0),
          0,
        )
    )
  }, 0)

  return {
    collectedThisMonth,
    overdueAmount,
    overduePayments,
    remainingAmount,
    todayDueCount: todayDuePayments.length,
    todayDuePayments,
    totalCollected,
    totalExpected,
  }
}

export function toPaymentFormValues(payment: PaymentRecord): PaymentFormValues {
  return {
    due_date: payment.due_date ?? undefined,
    first_due_date: payment.due_date ?? undefined,
    installment_count: payment.installment_count ?? 1,
    notes: payment.notes ?? '',
    paid_amount: Number(payment.paid_amount ?? 0),
    parent_id: payment.parent_id ?? undefined,
    payment_date: payment.payment_date ?? undefined,
    payment_method: payment.payment_method ?? undefined,
    payment_status: payment.payment_status ?? 'odenmedi',
    registration_id: payment.registration_id ?? undefined,
    remaining_amount: Number(payment.remaining_amount ?? 0),
    total_amount: Number(payment.total_amount ?? 0),
  }
}

export function buildPaymentWhatsAppMessage(
  template: string | undefined,
  payment: PaymentRecord,
) {
  if (!template) {
    return undefined
  }

  const parent = getPaymentParentRecord(payment)
  const student = getPaymentStudent(payment)
  const program = getPaymentProgram(payment)
  const replacements = {
    en_yakin_odeme_tarihi: payment.nearest_due_date ?? '',
    geciken_tutar: new Intl.NumberFormat('tr-TR', {
      currency: 'TRY',
      maximumFractionDigits: 0,
      style: 'currency',
    }).format(payment.overdue_amount),
    kalan_tutar: new Intl.NumberFormat('tr-TR', {
      currency: 'TRY',
      maximumFractionDigits: 0,
      style: 'currency',
    }).format(Number(payment.remaining_amount ?? 0)),
    odenen_tutar: new Intl.NumberFormat('tr-TR', {
      currency: 'TRY',
      maximumFractionDigits: 0,
      style: 'currency',
    }).format(Number(payment.paid_amount ?? 0)),
    ogrenci_adi: student?.full_name ?? '',
    program_adi: program?.name ?? '',
    toplam_tutar: new Intl.NumberFormat('tr-TR', {
      currency: 'TRY',
      maximumFractionDigits: 0,
      style: 'currency',
    }).format(Number(payment.total_amount ?? 0)),
    veli_adi: parent?.full_name ?? '',
  }

  return Object.entries(replacements).reduce(
    (message, [key, value]) =>
      message.replaceAll(`{{${key}}}`, value).replaceAll(`{${key}}`, value),
    template,
  )
}
