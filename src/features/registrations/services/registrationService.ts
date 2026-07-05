import { supabase } from '../../../lib/supabase'
import type { RegistrationStatus } from '../../../types/database'
import { activeRegistrationStatuses } from '../constants'
import type {
  RegistrationAuthContext,
  RegistrationFiltersState,
  RegistrationFormValues,
  RegistrationRecord,
  RegistrationReferences,
  RegistrationSaveOptions,
  RegistrationTask,
} from '../types'

type ServiceResult<T> = {
  data?: T
  error?: string
}

const registrationSelect = `
  *,
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
  ),
  payments (
    id,
    registration_id,
    parent_id,
    total_amount,
    paid_amount,
    remaining_amount,
    payment_method,
    payment_status,
    due_date,
    payment_date,
    created_at
  )
`

function cleanText(value: string | null | undefined) {
  const trimmedValue = value?.trim()

  return trimmedValue && trimmedValue.length > 0 ? trimmedValue : null
}

function normalizeNumber(value: number | null | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0
  }

  return value
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

function enrichRegistration(registration: RegistrationRecord): RegistrationRecord {
  const payments = normalizeRelationArray(registration.payments)
  const paidAmount = payments.reduce(
    (total, payment) => total + Number(payment.paid_amount ?? 0),
    0,
  )
  const remainingAmount =
    payments.length > 0
      ? payments.reduce(
          (total, payment) => total + Number(payment.remaining_amount ?? 0),
          0,
        )
      : Number(registration.final_price ?? 0)

  return {
    ...registration,
    paid_amount: paidAmount,
    payments,
    remaining_amount: remainingAmount,
  }
}

function matchesSearch(registration: RegistrationRecord, search: string) {
  if (!search) {
    return true
  }

  const normalizedSearch = search.toLocaleLowerCase('tr')
  const parent = normalizeRelation(registration.parent)
  const student = normalizeRelation(registration.student)
  const program = normalizeRelation(registration.program)
  const values = [
    parent?.full_name,
    parent?.phone,
    student?.full_name,
    program?.name,
    registration.notes,
  ]

  return values.some((value) =>
    value?.toLocaleLowerCase('tr').includes(normalizedSearch),
  )
}

function calculateFinalPrice(values: RegistrationFormValues) {
  const totalPrice = normalizeNumber(values.total_price)
  const discountAmount = normalizeNumber(values.discount_amount)
  const finalPrice =
    typeof values.final_price === 'number' && !Number.isNaN(values.final_price)
      ? values.final_price
      : totalPrice - discountAmount

  return {
    discountAmount,
    finalPrice,
    totalPrice,
  }
}

async function getActiveRegistrationCount(
  programId: string,
  currentRegistrationId?: string,
) {
  const { data, error } = await supabase
    .from('registrations')
    .select('id')
    .eq('program_id', programId)
    .in('status', activeRegistrationStatuses)

  if (error) {
    return { error: 'Kontenjan kontrolü yapılamadı.' }
  }

  return {
    count: (data ?? []).filter(
      (registration) => registration.id !== currentRegistrationId,
    ).length,
  }
}

async function hasDuplicateActiveRegistration(
  studentId: string,
  programId: string,
  currentRegistrationId?: string,
) {
  const { data, error } = await supabase
    .from('registrations')
    .select('id')
    .eq('student_id', studentId)
    .eq('program_id', programId)
    .in('status', activeRegistrationStatuses)

  if (error) {
    return { error: 'Tekrarlı kayıt kontrolü yapılamadı.' }
  }

  const duplicate = (data ?? []).find(
    (registration) => registration.id !== currentRegistrationId,
  )

  return { duplicate: Boolean(duplicate) }
}

async function fetchParentTasks(parentId: string | null) {
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

  return (data ?? []) as RegistrationTask[]
}

function buildRegistrationPayload(
  values: RegistrationFormValues,
  auth: RegistrationAuthContext,
  editingRegistration?: RegistrationRecord | null,
) {
  const price = calculateFinalPrice(values)

  return {
    discount_amount: price.discountAmount,
    final_price: price.finalPrice,
    notes: cleanText(values.notes),
    parent_id: values.parent_id || null,
    program_id: values.program_id || null,
    registration_date: values.registration_date || new Date().toISOString().slice(0, 10),
    source_lead_id:
      values.source_lead_id ?? editingRegistration?.source_lead_id ?? null,
    status: values.status,
    student_id: values.student_id || null,
    total_price: price.totalPrice,
    ...(editingRegistration ? {} : { created_by: values.created_by ?? auth.userId }),
  }
}

export async function fetchRegistrationReferences(): Promise<
  ServiceResult<RegistrationReferences>
> {
  const [parentsResult, studentsResult, programsResult, templatesResult] =
    await Promise.all([
      supabase
        .from('parents')
        .select('id,full_name,phone,email')
        .order('full_name', { ascending: true }),
      supabase
        .from('students')
        .select('id,parent_id,full_name,age,school')
        .order('full_name', { ascending: true }),
      supabase
        .from('programs')
        .select('id,name,type,price,quota,is_active')
        .eq('is_active', true)
        .order('name', { ascending: true }),
      supabase
        .from('whatsapp_templates')
        .select('*')
        .eq('is_active', true)
        .order('title', { ascending: true }),
    ])

  if (parentsResult.error) {
    return { error: 'Veli listesi alınamadı.' }
  }

  if (studentsResult.error) {
    return { error: 'Öğrenci listesi alınamadı.' }
  }

  if (programsResult.error) {
    return { error: 'Program listesi alınamadı.' }
  }

  return {
    data: {
      parents: parentsResult.data ?? [],
      programs: programsResult.data ?? [],
      students: studentsResult.data ?? [],
      whatsappTemplates: templatesResult.error ? [] : templatesResult.data ?? [],
    },
  }
}

export async function fetchRegistrations(
  filters: RegistrationFiltersState,
): Promise<ServiceResult<RegistrationRecord[]>> {
  let query = supabase
    .from('registrations')
    .select(registrationSelect)
    .order('created_at', { ascending: false })

  if (filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters.programId !== 'all') {
    query = query.eq('program_id', filters.programId)
  }

  if (filters.dateFrom) {
    query = query.gte('registration_date', filters.dateFrom)
  }

  if (filters.dateTo) {
    query = query.lte('registration_date', filters.dateTo)
  }

  const { data, error } = await query

  if (error) {
    return { error: 'Kayıt listesi alınamadı.' }
  }

  const registrations = ((data ?? []) as RegistrationRecord[])
    .map(enrichRegistration)
    .filter((registration) =>
      matchesSearch(registration, filters.search.trim()),
    )

  return { data: registrations }
}

export async function fetchRegistrationDetail(
  registrationId: string,
): Promise<ServiceResult<RegistrationRecord>> {
  const { data, error } = await supabase
    .from('registrations')
    .select(registrationSelect)
    .eq('id', registrationId)
    .maybeSingle()

  if (error || !data) {
    return { error: 'Kayıt detayı alınamadı.' }
  }

  const registration = enrichRegistration(data as RegistrationRecord)
  const tasks = await fetchParentTasks(registration.parent_id)

  return {
    data: {
      ...registration,
      tasks,
    },
  }
}

export async function saveRegistration(
  values: RegistrationFormValues,
  auth: RegistrationAuthContext,
  editingRegistration?: RegistrationRecord | null,
  options: RegistrationSaveOptions = {},
): Promise<ServiceResult<RegistrationRecord>> {
  if (!values.parent_id) {
    return { error: 'Veli seçmelisiniz.' }
  }

  if (!values.student_id) {
    return { error: 'Öğrenci seçmelisiniz.' }
  }

  if (!values.program_id) {
    return { error: 'Program seçmelisiniz.' }
  }

  if (!auth.userId) {
    return { error: 'Oturum kullanıcısı bulunamadı.' }
  }

  const price = calculateFinalPrice(values)

  if (price.finalPrice < 0) {
    return { error: 'Net fiyat sıfırın altında olamaz.' }
  }

  const duplicateResult = await hasDuplicateActiveRegistration(
    values.student_id,
    values.program_id,
    editingRegistration?.id,
  )

  if (duplicateResult.error) {
    return { error: duplicateResult.error }
  }

  if (duplicateResult.duplicate && activeRegistrationStatuses.includes(values.status)) {
    return {
      error: 'Bu öğrenci aynı programda zaten aktif bir kayda sahip.',
    }
  }

  if (activeRegistrationStatuses.includes(values.status)) {
    const [programResult, countResult] = await Promise.all([
      supabase
        .from('programs')
        .select('id,name,quota')
        .eq('id', values.program_id)
        .maybeSingle(),
      getActiveRegistrationCount(values.program_id, editingRegistration?.id),
    ])

    if (programResult.error || !programResult.data) {
      return { error: 'Program bilgisi alınamadı.' }
    }

    if (countResult.error) {
      return { error: countResult.error }
    }

    const quota = Number(programResult.data.quota ?? 0)
    const activeCount = countResult.count ?? 0
    const isFull = quota > 0 && activeCount >= quota

    if (isFull && (!auth.isAdmin || !options.allowCapacityOverride)) {
      return {
        error: auth.isAdmin
          ? 'Program kontenjanı dolu. Devam etmek için kontenjan aşımını onaylayın.'
          : 'Program kontenjanı dolu. Satış personeli dolu programa kayıt oluşturamaz.',
      }
    }
  }

  const payload = buildRegistrationPayload(values, auth, editingRegistration)
  const result = editingRegistration
    ? await supabase
        .from('registrations')
        .update(payload)
        .eq('id', editingRegistration.id)
        .select(registrationSelect)
        .maybeSingle()
    : await supabase
        .from('registrations')
        .insert(payload)
        .select(registrationSelect)
        .maybeSingle()

  if (result.error || !result.data) {
    return {
      error: editingRegistration
        ? 'Kayıt güncellenemedi.'
        : 'Kayıt oluşturulamadı.',
    }
  }

  return { data: enrichRegistration(result.data as RegistrationRecord) }
}

export function getRegistrationParent(registration: RegistrationRecord) {
  return normalizeRelation(registration.parent)
}

export function getRegistrationStudent(registration: RegistrationRecord) {
  return normalizeRelation(registration.student)
}

export function getRegistrationProgram(registration: RegistrationRecord) {
  return normalizeRelation(registration.program)
}

export function isActiveRegistrationStatus(status: RegistrationStatus | null) {
  return activeRegistrationStatuses.includes(status ?? 'on_kayit')
}

export function toRegistrationFormValues(
  registration: RegistrationRecord,
): RegistrationFormValues {
  return {
    created_by: registration.created_by ?? undefined,
    discount_amount: Number(registration.discount_amount ?? 0),
    final_price: Number(registration.final_price ?? 0),
    notes: registration.notes ?? '',
    parent_id: registration.parent_id ?? undefined,
    program_id: registration.program_id ?? undefined,
    registration_date: registration.registration_date ?? undefined,
    source_lead_id: registration.source_lead_id ?? undefined,
    status: registration.status ?? 'on_kayit',
    student_id: registration.student_id ?? undefined,
    total_price: Number(registration.total_price ?? 0),
  }
}

export function getDefaultRegistrationValues(
  values: Partial<RegistrationFormValues> = {},
): RegistrationFormValues {
  return {
    discount_amount: values.discount_amount ?? 0,
    final_price: values.final_price ?? values.total_price ?? 0,
    notes: values.notes ?? '',
    parent_id: values.parent_id,
    program_id: values.program_id,
    registration_date:
      values.registration_date ?? new Date().toISOString().slice(0, 10),
    source_lead_id: values.source_lead_id,
    status: values.status ?? 'on_kayit',
    student_id: values.student_id,
    total_price: values.total_price ?? 0,
  }
}
