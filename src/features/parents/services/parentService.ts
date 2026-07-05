import { supabase } from '../../../lib/supabase'
import type {
  Lead,
  LeadStatus,
  PaymentStatus,
  RegistrationStatus,
} from '../../../types/database'
import { getCurrentMonthRange } from '../../../utils/date'
import { normalizeTurkeyPhone } from '../../../utils/phone'
import type {
  ParentAuthContext,
  ParentDashboardMetrics,
  ParentFiltersState,
  ParentFormValues,
  ParentRecord,
  ParentReferences,
} from '../types'

type ServiceResult<T> = {
  data?: T
  duplicateParent?: ParentRecord
  error?: string
  registrationId?: string
}

type LeadConversionValues = {
  createRegistration: boolean
  programId: string
  leadStatus: Extract<LeadStatus, 'kayit_oldu' | 'odeme_bekleniyor'>
}

const activeRegistrationStatuses: RegistrationStatus[] = [
  'on_kayit',
  'kesin_kayit',
]

const parentSelect = `
  *,
  students (
    *
  ),
  registrations (
    *,
    program:programs (
      id,
      name,
      type
    ),
    student:students (
      id,
      full_name
    )
  ),
  payments (
    id,
    parent_id,
    registration_id,
    total_amount,
    paid_amount,
    remaining_amount,
    payment_status,
    due_date,
    payment_date,
    created_at
  ),
  call_logs (
    id,
    parent_id,
    user_id,
    call_status,
    call_date,
    next_call_date,
    notes,
    created_at,
    user:profiles (
      id,
      full_name
    )
  ),
  tasks:tasks!tasks_related_parent_id_fkey (
    id,
    title,
    description,
    related_parent_id,
    assigned_user_id,
    created_by,
    due_date,
    status,
    priority,
    created_at
  )
`

function cleanText(value: string | null | undefined) {
  const trimmedValue = value?.trim()

  return trimmedValue && trimmedValue.length > 0 ? trimmedValue : null
}

function normalizeNumber(value: number | null | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null
  }

  return value
}

function normalizeRelationArray<T>(value: T[] | null | undefined) {
  return Array.isArray(value) ? value : []
}

function buildParentPayload(
  values: ParentFormValues,
  auth: ParentAuthContext,
  sourceLeadId?: string | null,
) {
  return {
    address: cleanText(values.address),
    created_by: values.created_by ?? auth.userId,
    email: cleanText(values.email),
    full_name: values.full_name.trim(),
    notes: cleanText(values.notes),
    phone: values.phone.trim(),
    source_lead_id: values.source_lead_id ?? sourceLeadId ?? null,
  }
}

function getLastContactDate(parent: ParentRecord) {
  const logs = normalizeRelationArray(parent.call_logs)
  const latestLog = logs
    .filter((log) => log.call_date)
    .sort((a, b) => {
      const first = new Date(a.call_date ?? 0).getTime()
      const second = new Date(b.call_date ?? 0).getTime()

      return second - first
    })[0]

  return latestLog?.call_date ?? null
}

function enrichParent(parent: ParentRecord): ParentRecord {
  const students = normalizeRelationArray(parent.students)
  const registrations = normalizeRelationArray(parent.registrations)
  const payments = normalizeRelationArray(parent.payments)
  const activeRegistrations = registrations.filter((registration) =>
    activeRegistrationStatuses.includes(
      registration.status ?? 'on_kayit',
    ),
  )

  const totalPaymentAmount = payments.reduce(
    (total, payment) => total + Number(payment.total_amount ?? 0),
    0,
  )
  const remainingPaymentAmount = payments.reduce(
    (total, payment) => total + Number(payment.remaining_amount ?? 0),
    0,
  )

  return {
    ...parent,
    active_registration_count: activeRegistrations.length,
    last_contact_date: getLastContactDate(parent),
    remaining_payment_amount: remainingPaymentAmount,
    student_count: students.length,
    total_payment_amount: totalPaymentAmount,
  }
}

function matchesSearch(parent: ParentRecord, search: string) {
  if (!search) {
    return true
  }

  const normalizedSearch = search.toLocaleLowerCase('tr')
  const students = normalizeRelationArray(parent.students)
  const values = [
    parent.full_name,
    parent.phone,
    parent.email,
    ...students.map((student) => student.full_name),
  ]

  return values.some((value) =>
    value?.toLocaleLowerCase('tr').includes(normalizedSearch),
  )
}

function matchesProgram(parent: ParentRecord, programId: string) {
  if (programId === 'all') {
    return true
  }

  return normalizeRelationArray(parent.registrations).some(
    (registration) => registration.program_id === programId,
  )
}

function matchesPaymentStatus(
  parent: ParentRecord,
  paymentStatus: PaymentStatus | 'all',
) {
  if (paymentStatus === 'all') {
    return true
  }

  return normalizeRelationArray(parent.payments).some(
    (payment) => payment.payment_status === paymentStatus,
  )
}

function matchesActiveRegistration(
  parent: ParentRecord,
  activeRegistration: ParentFiltersState['activeRegistration'],
) {
  if (activeRegistration === 'all') {
    return true
  }

  const hasActive = parent.active_registration_count > 0

  return activeRegistration === 'yes' ? hasActive : !hasActive
}

function findDuplicateParent(
  parents: ParentRecord[],
  phone: string,
  currentParentId?: string,
) {
  const normalizedPhone = normalizeTurkeyPhone(phone)

  if (!normalizedPhone) {
    return null
  }

  return (
    parents.find((parent) => {
      if (parent.id === currentParentId) {
        return false
      }

      return normalizeTurkeyPhone(parent.phone) === normalizedPhone
    }) ?? null
  )
}

export async function fetchParentReferences(): Promise<
  ServiceResult<ParentReferences>
> {
  const [programResult, templateResult] = await Promise.all([
    supabase
      .from('programs')
      .select('id,name,type,is_active')
      .eq('is_active', true)
      .order('name', { ascending: true }),
    supabase
      .from('whatsapp_templates')
      .select('*')
      .eq('is_active', true)
      .order('title', { ascending: true }),
  ])

  if (programResult.error) {
    return { error: 'Program listesi alınamadı.' }
  }

  return {
    data: {
      programs: programResult.data ?? [],
      whatsappTemplates: templateResult.error ? [] : templateResult.data ?? [],
    },
  }
}

export async function fetchParents(
  filters: ParentFiltersState,
): Promise<ServiceResult<ParentRecord[]>> {
  const { data, error } = await supabase
    .from('parents')
    .select(parentSelect)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: 'Veli listesi alınamadı.' }
  }

  const parents = ((data ?? []) as ParentRecord[])
    .map(enrichParent)
    .filter((parent) => matchesSearch(parent, filters.search.trim()))
    .filter((parent) => matchesProgram(parent, filters.programId))
    .filter((parent) => matchesPaymentStatus(parent, filters.paymentStatus))
    .filter((parent) =>
      matchesActiveRegistration(parent, filters.activeRegistration),
    )

  return { data: parents }
}

export async function fetchParentDetail(
  parentId: string,
): Promise<ServiceResult<ParentRecord>> {
  const { data, error } = await supabase
    .from('parents')
    .select(parentSelect)
    .eq('id', parentId)
    .maybeSingle()

  if (error || !data) {
    return { error: 'Veli detayı alınamadı.' }
  }

  return { data: enrichParent(data as ParentRecord) }
}

export async function saveParent(
  values: ParentFormValues,
  auth: ParentAuthContext,
  editingParent?: ParentRecord | null,
): Promise<ServiceResult<ParentRecord>> {
  if (!values.full_name.trim() || !values.phone.trim()) {
    return { error: 'Veli adı soyadı ve telefon zorunludur.' }
  }

  const allParentsResult = await fetchParents({
    activeRegistration: 'all',
    paymentStatus: 'all',
    programId: 'all',
    search: '',
  })

  if (allParentsResult.error) {
    return { error: allParentsResult.error }
  }

  const duplicateParent = findDuplicateParent(
    allParentsResult.data ?? [],
    values.phone,
    editingParent?.id,
  )

  if (duplicateParent) {
    return {
      duplicateParent,
      error: 'Bu telefon numarası ile kayıtlı bir veli var.',
    }
  }

  const payload = buildParentPayload(values, auth)

  const result = editingParent
    ? await supabase
        .from('parents')
        .update(payload)
        .eq('id', editingParent.id)
        .select(parentSelect)
        .maybeSingle()
    : await supabase
        .from('parents')
        .insert(payload)
        .select(parentSelect)
        .maybeSingle()

  if (result.error || !result.data) {
    return {
      error: editingParent
        ? 'Veli güncellenemedi.'
        : 'Veli oluşturulamadı.',
    }
  }

  return { data: enrichParent(result.data as ParentRecord) }
}

export async function convertLeadToParentStudent(
  lead: Lead,
  values: LeadConversionValues,
  auth: ParentAuthContext,
): Promise<ServiceResult<ParentRecord>> {
  if (!lead.full_name.trim() || !lead.phone.trim()) {
    return { error: 'Lead içinde veli adı ve telefon bulunmalıdır.' }
  }

  const parentsResult = await fetchParents({
    activeRegistration: 'all',
    paymentStatus: 'all',
    programId: 'all',
    search: '',
  })

  if (parentsResult.error) {
    return { error: parentsResult.error }
  }

  const duplicateParent = findDuplicateParent(
    parentsResult.data ?? [],
    lead.phone,
  )
  let parentId = duplicateParent?.id

  if (!parentId) {
    const parentResult = await supabase
      .from('parents')
      .insert(
        buildParentPayload(
          {
            email: lead.email ?? undefined,
            full_name: lead.full_name,
            notes: lead.notes ?? undefined,
            phone: lead.phone,
          },
          auth,
          lead.id,
        ),
      )
      .select(parentSelect)
      .maybeSingle()

    if (parentResult.error || !parentResult.data) {
      return { error: 'Lead veli kaydına dönüştürülemedi.' }
    }

    parentId = parentResult.data.id
  }

  if (!parentId) {
    return { error: 'Veli kaydı belirlenemedi.' }
  }

  const childName = cleanText(lead.child_name)
  let registrationId: string | undefined

  if (childName) {
    const { data: existingStudents, error: studentCheckError } = await supabase
      .from('students')
      .select('id,full_name')
      .eq('parent_id', parentId)

    if (studentCheckError) {
      return { error: 'Öğrenci kontrolü yapılamadı.' }
    }

    const hasSameChild = (existingStudents ?? []).some(
      (student) =>
        student.full_name.toLocaleLowerCase('tr') ===
        childName.toLocaleLowerCase('tr'),
    )

    if (hasSameChild) {
      return {
        ...(duplicateParent ? { duplicateParent } : {}),
        error: 'Bu veli altında aynı isimde öğrenci var.',
      }
    }

    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .insert({
        age: normalizeNumber(lead.child_age),
        created_by: auth.userId,
        full_name: childName,
        parent_id: parentId,
        source_lead_id: lead.id,
      })
      .select('id')
      .maybeSingle()

    if (studentError || !studentData) {
      return { error: 'Öğrenci kaydı oluşturulamadı.' }
    }

    if (values.createRegistration && values.programId) {
      const { data: programData } = await supabase
        .from('programs')
        .select('price')
        .eq('id', values.programId)
        .maybeSingle()
      const price = Number(programData?.price ?? 0)
      const { data: registrationData, error: registrationError } = await supabase
        .from('registrations')
        .insert({
          created_by: auth.userId,
          final_price: price,
          parent_id: parentId,
          program_id: values.programId,
          source_lead_id: lead.id,
          student_id: studentData.id,
          total_price: price,
          status:
            values.leadStatus === 'kayit_oldu' ? 'kesin_kayit' : 'on_kayit',
        })
        .select('id')
        .maybeSingle()

      registrationId = registrationData?.id

      if (registrationError || !registrationData) {
        return { error: 'Kayıt oluşturulamadı.' }
      }
    }
  }

  await supabase
    .from('leads')
    .update({ status: values.leadStatus })
    .eq('id', lead.id)

  const parentResult = await fetchParentDetail(parentId)

  return {
    ...parentResult,
    registrationId,
  }
}

async function countTable(tableName: 'parents' | 'students') {
  const { count, error } = await supabase
    .from(tableName)
    .select('id', { count: 'exact', head: true })

  if (error) {
    return 0
  }

  return count ?? 0
}

export async function fetchParentDashboardMetrics(): Promise<ParentDashboardMetrics> {
  const monthRange = getCurrentMonthRange()

  const [
    totalParents,
    totalStudents,
    activeRegistrationsResult,
    parentsThisMonthResult,
    studentsThisMonthResult,
  ] = await Promise.all([
    countTable('parents'),
    countTable('students'),
    supabase
      .from('registrations')
      .select('student_id')
      .in('status', activeRegistrationStatuses),
    supabase
      .from('parents')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', monthRange.start)
      .lt('created_at', monthRange.end),
    supabase
      .from('students')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', monthRange.start)
      .lt('created_at', monthRange.end),
  ])

  const activeStudentIds = new Set(
    (activeRegistrationsResult.data ?? [])
      .map((registration) => registration.student_id)
      .filter(Boolean),
  )

  return {
    activeStudents: activeRegistrationsResult.error ? 0 : activeStudentIds.size,
    parentsThisMonth: parentsThisMonthResult.count ?? 0,
    studentsThisMonth: studentsThisMonthResult.count ?? 0,
    totalParents,
    totalStudents,
  }
}
