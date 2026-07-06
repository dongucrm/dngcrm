import { supabase } from '../../../lib/supabase'
import type { PaymentStatus, RegistrationStatus } from '../../../types/database'
import type {
  StudentAuthContext,
  StudentFiltersState,
  StudentFormValues,
  StudentRecord,
  StudentReferences,
} from '../types'

type ServiceResult<T> = {
  data?: T
  error?: string
}

const activeRegistrationStatuses: RegistrationStatus[] = [
  'on_kayit',
  'kesin_kayit',
]

const studentSelect = `
  *,
  parent:parents (
    id,
    full_name,
    phone,
    email,
    created_by,
    source_lead_id
  ),
  registrations (
    *,
    program:programs (
      id,
      name,
      type
    )
  )
`

function cleanText(value: string | null | undefined) {
  const trimmedValue = value?.trim()

  return trimmedValue && trimmedValue.length > 0 ? trimmedValue : null
}

function normalizeNumber(value: number | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null
  }

  return value
}

function normalizeRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

function normalizeRelationArray<T>(value: T[] | null | undefined) {
  return Array.isArray(value) ? value : []
}

function getActiveRegistration(student: StudentRecord) {
  return normalizeRelationArray(student.registrations).find((registration) =>
    activeRegistrationStatuses.includes(
      registration.status ?? 'on_kayit',
    ),
  )
}

function getRegistrationProgramName(student: StudentRecord) {
  const activeRegistration = getActiveRegistration(student)
  const program = normalizeRelation(activeRegistration?.program)

  return program?.name ?? null
}

function enrichStudent(
  student: StudentRecord,
  paymentsByParent: Map<string, StudentRecord['payments']>,
): StudentRecord {
  const activeRegistration = getActiveRegistration(student)
  const registrationIds = normalizeRelationArray(student.registrations).map(
    (registration) => registration.id,
  )
  const payments = (paymentsByParent.get(student.parent_id ?? '') ?? []).filter(
    (payment) =>
      payment.registration_id
        ? registrationIds.includes(payment.registration_id)
        : false,
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
    ...student,
    active_program_name: getRegistrationProgramName(student),
    active_registration_status: activeRegistration?.status ?? null,
    payments,
    remaining_payment_amount: remainingPaymentAmount,
    total_payment_amount: totalPaymentAmount,
  }
}

function matchesSearch(student: StudentRecord, search: string) {
  if (!search) {
    return true
  }

  const parent = normalizeRelation(student.parent)
  const normalizedSearch = search.toLocaleLowerCase('tr')
  const values = [
    student.full_name,
    student.school,
    student.notes,
    parent?.full_name,
    parent?.phone,
  ]

  return values.some((value) =>
    value?.toLocaleLowerCase('tr').includes(normalizedSearch),
  )
}

function matchesProgram(student: StudentRecord, programId: string) {
  if (programId === 'all') {
    return true
  }

  return normalizeRelationArray(student.registrations).some(
    (registration) => registration.program_id === programId,
  )
}

function matchesPaymentStatus(
  student: StudentRecord,
  paymentStatus: PaymentStatus | 'all',
) {
  if (paymentStatus === 'all') {
    return true
  }

  return normalizeRelationArray(student.payments).some(
    (payment) => payment.payment_status === paymentStatus,
  )
}

function matchesActiveRegistration(
  student: StudentRecord,
  activeRegistration: StudentFiltersState['activeRegistration'],
) {
  if (activeRegistration === 'all') {
    return true
  }

  const hasActive = Boolean(student.active_registration_status)

  return activeRegistration === 'yes' ? hasActive : !hasActive
}

function buildStudentPayload(
  values: StudentFormValues,
  auth: StudentAuthContext,
) {
  return {
    age: normalizeNumber(values.age),
    birth_date: values.birth_date || null,
    created_by: values.created_by ?? auth.userId,
    full_name: values.full_name.trim(),
    notes: cleanText(values.notes),
    parent_id: values.parent_id || null,
    school: cleanText(values.school),
    source_lead_id: values.source_lead_id ?? null,
  }
}

async function fetchPaymentsForParents(parentIds: string[]) {
  if (parentIds.length === 0) {
    return new Map<string, StudentRecord['payments']>()
  }

  const { data, error } = await supabase
    .from('payments')
    .select(
      'id,parent_id,registration_id,total_amount,paid_amount,remaining_amount,payment_status,due_date,payment_date,installments:payment_installments(*)',
    )
    .in('parent_id', parentIds)

  if (error) {
    return new Map<string, StudentRecord['payments']>()
  }

  const paymentsByParent = new Map<string, StudentRecord['payments']>()

  ;(data ?? []).forEach((payment) => {
    if (!payment.parent_id) {
      return
    }

    const currentPayments = paymentsByParent.get(payment.parent_id) ?? []
    currentPayments.push(payment)
    paymentsByParent.set(payment.parent_id, currentPayments)
  })

  return paymentsByParent
}

export async function fetchStudentReferences(): Promise<
  ServiceResult<StudentReferences>
> {
  const [parentsResult, programsResult] = await Promise.all([
    supabase
      .from('parents')
      .select('id,full_name,phone,email,created_by,source_lead_id')
      .order('full_name', { ascending: true }),
    supabase
      .from('programs')
      .select('id,name,type,is_active')
      .eq('is_active', true)
      .order('name', { ascending: true }),
  ])

  if (parentsResult.error) {
    return { error: 'Veli listesi alınamadı.' }
  }

  if (programsResult.error) {
    return { error: 'Program listesi alınamadı.' }
  }

  return {
    data: {
      parents: parentsResult.data ?? [],
      programs: programsResult.data ?? [],
    },
  }
}

export async function fetchStudents(
  filters: StudentFiltersState,
): Promise<ServiceResult<StudentRecord[]>> {
  const { data, error } = await supabase
    .from('students')
    .select(studentSelect)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: 'Öğrenci listesi alınamadı.' }
  }

  const rawStudents = (data ?? []) as StudentRecord[]
  const parentIds = Array.from(
    new Set(rawStudents.map((student) => student.parent_id).filter(Boolean)),
  ) as string[]
  const paymentsByParent = await fetchPaymentsForParents(parentIds)

  const students = rawStudents
    .map((student) => enrichStudent(student, paymentsByParent))
    .filter((student) => matchesSearch(student, filters.search.trim()))
    .filter((student) =>
      filters.parentId === 'all' ? true : student.parent_id === filters.parentId,
    )
    .filter((student) => matchesProgram(student, filters.programId))
    .filter((student) => matchesPaymentStatus(student, filters.paymentStatus))
    .filter((student) =>
      matchesActiveRegistration(student, filters.activeRegistration),
    )

  return { data: students }
}

export async function fetchStudentDetail(
  studentId: string,
): Promise<ServiceResult<StudentRecord>> {
  const { data, error } = await supabase
    .from('students')
    .select(studentSelect)
    .eq('id', studentId)
    .maybeSingle()

  if (error || !data) {
    return { error: 'Öğrenci detayı alınamadı.' }
  }

  const student = data as StudentRecord
  const paymentsByParent = await fetchPaymentsForParents(
    student.parent_id ? [student.parent_id] : [],
  )

  return { data: enrichStudent(student, paymentsByParent) }
}

export async function fetchStudentsForParent(
  parentId: string,
): Promise<ServiceResult<StudentRecord[]>> {
  return fetchStudents({
    activeRegistration: 'all',
    parentId,
    paymentStatus: 'all',
    programId: 'all',
    search: '',
  })
}

export async function saveStudent(
  values: StudentFormValues,
  auth: StudentAuthContext,
  editingStudent?: StudentRecord | null,
): Promise<ServiceResult<StudentRecord>> {
  if (!values.full_name.trim()) {
    return { error: 'Öğrenci adı soyadı zorunludur.' }
  }

  if (!values.parent_id) {
    return { error: 'Veli seçmelisiniz.' }
  }

  const payload = buildStudentPayload(values, auth)

  const result = editingStudent
    ? await supabase
        .from('students')
        .update(payload)
        .eq('id', editingStudent.id)
        .select(studentSelect)
        .maybeSingle()
    : await supabase
        .from('students')
        .insert(payload)
        .select(studentSelect)
        .maybeSingle()

  if (result.error || !result.data) {
    return {
      error: editingStudent
        ? 'Öğrenci güncellenemedi.'
        : 'Öğrenci oluşturulamadı.',
    }
  }

  const student = result.data as StudentRecord
  const paymentsByParent = await fetchPaymentsForParents(
    student.parent_id ? [student.parent_id] : [],
  )

  return { data: enrichStudent(student, paymentsByParent) }
}

export function getStudentParent(student: StudentRecord) {
  return normalizeRelation(student.parent)
}

export function getStudentProgramLabel(student: StudentRecord) {
  return student.active_program_name ?? '-'
}
