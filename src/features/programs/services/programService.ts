import { supabase } from '../../../lib/supabase'
import type { ProgramType, RegistrationStatus } from '../../../types/database'
import { getCurrentMonthRange } from '../../../utils/date'
import { activeRegistrationStatuses } from '../../registrations/constants'
import type {
  ProgramDashboardMetrics,
  ProgramFiltersState,
  ProgramFormValues,
  ProgramLead,
  ProgramRecord,
  ProgramRegistration,
  ProgramSummary,
} from '../types'

type ServiceResult<T> = {
  data?: T
  error?: string
}

const programSelect = `
  *,
  registrations (
    *,
    parent:parents (
      id,
      full_name,
      phone,
      email
    ),
    student:students (
      id,
      full_name
    ),
    payments (
      id,
      paid_amount,
      remaining_amount,
      total_amount,
      payment_status
    )
  )
`

const recentRegistrationSelect = `
  *,
  parent:parents (
    id,
    full_name,
    phone,
    email
  ),
  student:students (
    id,
    full_name
  ),
  payments (
    id,
    paid_amount,
    remaining_amount,
    total_amount,
    payment_status
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

function normalizeRelationArray<T>(value: T[] | null | undefined) {
  return Array.isArray(value) ? value : []
}

function getActiveRegistrations(registrations: ProgramRegistration[]) {
  return registrations.filter((registration) =>
    activeRegistrationStatuses.includes(
      registration.status ?? 'on_kayit',
    ),
  )
}

function calculateProgramSummary(
  quota: number | null,
  registrations: ProgramRegistration[],
): ProgramSummary {
  const confirmedRegistrations = registrations.filter(
    (registration) => registration.status === 'kesin_kayit',
  )
  const preRegistrations = registrations.filter(
    (registration) => registration.status === 'on_kayit',
  )
  const cancelledRegistrations = registrations.filter(
    (registration) => registration.status === 'iptal',
  )
  const activeRegistrations = getActiveRegistrations(registrations)
  const paidAmount = registrations.reduce((total, registration) => {
    const payments = normalizeRelationArray(registration.payments)

    return (
      total +
      payments.reduce(
        (paymentTotal, payment) =>
          paymentTotal + Number(payment.paid_amount ?? 0),
        0,
      )
    )
  }, 0)
  const remainingAmount = registrations.reduce((total, registration) => {
    const payments = normalizeRelationArray(registration.payments)

    if (payments.length === 0) {
      return total + Number(registration.final_price ?? 0)
    }

    return (
      total +
      payments.reduce(
        (paymentTotal, payment) =>
          paymentTotal + Number(payment.remaining_amount ?? 0),
        0,
      )
    )
  }, 0)
  const expectedIncome = activeRegistrations.reduce(
    (total, registration) => total + Number(registration.final_price ?? 0),
    0,
  )
  const registeredCount = activeRegistrations.length
  const remainingQuota =
    quota && quota > 0 ? Math.max(quota - registeredCount, 0) : null
  const fillRate = quota && quota > 0 ? Math.min((registeredCount / quota) * 100, 100) : 0

  return {
    cancelledCount: cancelledRegistrations.length,
    confirmedCount: confirmedRegistrations.length,
    expectedIncome,
    fillRate,
    paidAmount,
    preRegistrationCount: preRegistrations.length,
    registeredCount,
    remainingAmount,
    remainingQuota,
  }
}

function enrichProgram(program: ProgramRecord): ProgramRecord {
  const registrations = normalizeRelationArray(program.registrations)
  const summary = calculateProgramSummary(program.quota, registrations)

  return {
    ...program,
    ...summary,
    registrations,
  }
}

function matchesSearch(program: ProgramRecord, search: string) {
  if (!search) {
    return true
  }

  const normalizedSearch = search.toLocaleLowerCase('tr')
  const values = [program.name, program.description, program.notes]

  return values.some((value) =>
    value?.toLocaleLowerCase('tr').includes(normalizedSearch),
  )
}

function matchesDateRange(program: ProgramRecord, filters: ProgramFiltersState) {
  const start = program.start_date ? new Date(program.start_date).getTime() : null

  if (filters.dateFrom && start && start < new Date(filters.dateFrom).getTime()) {
    return false
  }

  if (filters.dateTo && start && start > new Date(filters.dateTo).getTime()) {
    return false
  }

  return true
}

function buildProgramPayload(values: ProgramFormValues) {
  return {
    description: cleanText(values.description),
    end_date: values.end_date || null,
    is_active: values.is_active,
    name: values.name.trim(),
    notes: cleanText(values.notes),
    price: normalizeNumber(values.price) ?? 0,
    quota: normalizeNumber(values.quota),
    start_date: values.start_date || null,
    type: values.type,
  }
}

export async function fetchPrograms(
  filters: ProgramFiltersState,
): Promise<ServiceResult<ProgramRecord[]>> {
  let query = supabase
    .from('programs')
    .select(programSelect)
    .order('start_date', { ascending: false, nullsFirst: false })

  if (filters.type !== 'all') {
    query = query.eq('type', filters.type)
  }

  if (filters.isActive !== 'all') {
    query = query.eq('is_active', filters.isActive === 'active')
  }

  const { data, error } = await query

  if (error) {
    return { error: 'Program listesi alınamadı.' }
  }

  const programs = ((data ?? []) as ProgramRecord[])
    .map(enrichProgram)
    .filter((program) => matchesSearch(program, filters.search.trim()))
    .filter((program) => matchesDateRange(program, filters))

  return { data: programs }
}

export async function fetchProgramDetail(
  programId: string,
): Promise<ServiceResult<ProgramRecord>> {
  const [programResult, leadsResult] = await Promise.all([
    supabase
      .from('programs')
      .select(programSelect)
      .eq('id', programId)
      .maybeSingle(),
    supabase
      .from('leads')
      .select('id,assigned_user_id,child_name,full_name,phone,probability,status')
      .eq('interested_program_id', programId)
      .order('created_at', { ascending: false }),
  ])

  if (programResult.error || !programResult.data) {
    return { error: 'Program detayı alınamadı.' }
  }

  const program = enrichProgram(programResult.data as ProgramRecord)

  return {
    data: {
      ...program,
      leads: leadsResult.error ? [] : ((leadsResult.data ?? []) as ProgramLead[]),
    },
  }
}

export async function saveProgram(
  values: ProgramFormValues,
  editingProgram?: ProgramRecord | null,
): Promise<ServiceResult<ProgramRecord>> {
  if (!values.name.trim()) {
    return { error: 'Program adı zorunludur.' }
  }

  if (!values.type) {
    return { error: 'Program tipi zorunludur.' }
  }

  const payload = buildProgramPayload(values)
  const result = editingProgram
    ? await supabase
        .from('programs')
        .update(payload)
        .eq('id', editingProgram.id)
        .select(programSelect)
        .maybeSingle()
    : await supabase
        .from('programs')
        .insert(payload)
        .select(programSelect)
        .maybeSingle()

  if (result.error || !result.data) {
    return {
      error: editingProgram
        ? 'Program güncellenemedi.'
        : 'Program oluşturulamadı.',
    }
  }

  return { data: enrichProgram(result.data as ProgramRecord) }
}

export async function toggleProgramActive(
  program: ProgramRecord,
): Promise<ServiceResult<ProgramRecord>> {
  const { data, error } = await supabase
    .from('programs')
    .update({ is_active: !program.is_active })
    .eq('id', program.id)
    .select(programSelect)
    .maybeSingle()

  if (error || !data) {
    return { error: 'Program durumu güncellenemedi.' }
  }

  return { data: enrichProgram(data as ProgramRecord) }
}

async function countPrograms(build: (query: any) => any) {
  const { count, error } = await build(
    supabase.from('programs').select('id', { count: 'exact', head: true }),
  )

  if (error) {
    return 0
  }

  return count ?? 0
}

async function countRegistrations(build: (query: any) => any) {
  const { count, error } = await build(
    supabase.from('registrations').select('id', { count: 'exact', head: true }),
  )

  if (error) {
    return 0
  }

  return count ?? 0
}

export async function fetchProgramDashboardMetrics(): Promise<ProgramDashboardMetrics> {
  const monthRange = getCurrentMonthRange()

  const [
    totalPrograms,
    activePrograms,
    totalRegistrations,
    confirmedRegistrations,
    preRegistrations,
    cancelledRegistrations,
    registrationsThisMonth,
    programsResult,
    recentResult,
  ] = await Promise.all([
    countPrograms((query) => query),
    countPrograms((query) => query.eq('is_active', true)),
    countRegistrations((query) => query),
    countRegistrations((query) => query.eq('status', 'kesin_kayit' satisfies RegistrationStatus)),
    countRegistrations((query) => query.eq('status', 'on_kayit' satisfies RegistrationStatus)),
    countRegistrations((query) => query.eq('status', 'iptal' satisfies RegistrationStatus)),
    countRegistrations((query) =>
      query.gte('created_at', monthRange.start).lt('created_at', monthRange.end),
    ),
    supabase.from('programs').select(programSelect),
    supabase
      .from('registrations')
      .select(recentRegistrationSelect)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const programs = ((programsResult.data ?? []) as ProgramRecord[]).map(
    enrichProgram,
  )
  const highestFillProgram = programs
    .filter((program) => Number(program.quota ?? 0) > 0)
    .sort((first, second) => second.fillRate - first.fillRate)[0]
  const programsNearCapacity = programs
    .filter(
      (program) =>
        Number(program.quota ?? 0) > 0 &&
        program.fillRate >= 80 &&
        Boolean(program.is_active),
    )
    .slice(0, 5)

  return {
    activePrograms,
    cancelledRegistrations,
    confirmedRegistrations,
    highestFillProgram: highestFillProgram
      ? {
          fillRate: highestFillProgram.fillRate,
          name: highestFillProgram.name,
        }
      : null,
    preRegistrations,
    programsNearCapacity,
    recentRegistrations: recentResult.error
      ? []
      : ((recentResult.data ?? []) as ProgramRegistration[]),
    registrationsThisMonth,
    totalPrograms,
    totalRegistrations,
  }
}

export function toProgramFormValues(program: ProgramRecord): ProgramFormValues {
  return {
    description: program.description ?? '',
    end_date: program.end_date ?? undefined,
    is_active: Boolean(program.is_active),
    name: program.name,
    notes: program.notes ?? '',
    price: Number(program.price ?? 0),
    quota: program.quota ?? undefined,
    start_date: program.start_date ?? undefined,
    type: program.type as ProgramType,
  }
}
