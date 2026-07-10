import { supabase } from '../../../lib/supabase'
import { isOverdue, isToday } from '../../../utils/date'
import type {
  CallReportRow,
  CallReportSummary,
  InstallmentReportRow,
  LeadSourceReportRow,
  PaymentReportRow,
  ProgramReportRow,
  ReportAuthContext,
  ReportChartPoint,
  ReportChartsData,
  ReportFilters,
  ReportsData,
  ReportSummary,
  SalesPerformanceReportRow,
  TaskReportRow,
  TaskReportSummary,
  WhatsAppReportRow,
  WhatsAppReportSummary,
} from '../types'

type ServiceResult<T> = {
  data?: T
  error?: string
}

type AnyRecord = Record<string, any>

function normalizeRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

function normalizeArray<T>(value: T[] | null | undefined) {
  return Array.isArray(value) ? value : []
}

function toNumber(value: number | string | null | undefined) {
  return Number(value ?? 0)
}

function isDateInRange(value: string | null | undefined, filters: ReportFilters) {
  if (!value) {
    return false
  }

  const date = value.slice(0, 10)

  return date >= filters.start && date <= filters.end
}

function getMonthKey(value: string | null | undefined) {
  if (!value) {
    return 'Tarih yok'
  }

  const date = new Date(value)

  return new Intl.DateTimeFormat('tr-TR', {
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function ratio(part: number, total: number) {
  if (total <= 0) {
    return 0
  }

  return Math.round((part / total) * 1000) / 10
}

function groupCount(rows: string[]) {
  return rows.reduce((map, key) => {
    map.set(key, (map.get(key) ?? 0) + 1)
    return map
  }, new Map<string, number>())
}

function mapToChartPoints(map: Map<string, number>): ReportChartPoint[] {
  return Array.from(map.entries()).map(([label, value]) => ({ label, value }))
}

function personName(record: AnyRecord | null | undefined) {
  return record?.full_name ?? '-'
}

function getRegistrationProgram(registration: AnyRecord) {
  return normalizeRelation<AnyRecord>(registration.program)
}

function getPaymentRegistration(payment: AnyRecord) {
  return normalizeRelation<AnyRecord>(payment.registration)
}

function getPaymentProgram(payment: AnyRecord) {
  return normalizeRelation<AnyRecord>(getPaymentRegistration(payment)?.program)
}

function getPaymentParent(payment: AnyRecord) {
  return (
    normalizeRelation<AnyRecord>(payment.parent) ??
    normalizeRelation<AnyRecord>(getPaymentRegistration(payment)?.parent)
  )
}

function getPaymentStudent(payment: AnyRecord) {
  return normalizeRelation<AnyRecord>(getPaymentRegistration(payment)?.student)
}

function getInstallmentPayment(installment: AnyRecord) {
  return normalizeRelation<AnyRecord>(installment.payment)
}

function getInstallmentProgram(installment: AnyRecord) {
  return normalizeRelation<AnyRecord>(getInstallmentPayment(installment)?.registration?.program)
}

function getInstallmentParent(installment: AnyRecord) {
  const payment = getInstallmentPayment(installment)

  return (
    normalizeRelation<AnyRecord>(payment?.parent) ??
    normalizeRelation<AnyRecord>(payment?.registration?.parent)
  )
}

function getInstallmentStudent(installment: AnyRecord) {
  return normalizeRelation<AnyRecord>(getInstallmentPayment(installment)?.registration?.student)
}

function getLeadFromCall(log: AnyRecord) {
  return normalizeRelation<AnyRecord>(log.lead)
}

function getParentFromCall(log: AnyRecord) {
  return normalizeRelation<AnyRecord>(log.parent)
}

function getTaskLead(task: AnyRecord) {
  return normalizeRelation<AnyRecord>(task.related_lead)
}

function getTaskParent(task: AnyRecord) {
  return normalizeRelation<AnyRecord>(task.related_parent)
}

function canSeeLead(lead: AnyRecord, auth: ReportAuthContext) {
  return auth.isAdmin || lead.assigned_user_id === auth.userId
}

function canSeeCreatedRecord(record: AnyRecord, auth: ReportAuthContext) {
  return auth.isAdmin || record.created_by === auth.userId
}

function canSeeRegistration(registration: AnyRecord, auth: ReportAuthContext) {
  return auth.isAdmin || registration.created_by === auth.userId
}

function canSeePayment(payment: AnyRecord, auth: ReportAuthContext) {
  const registration = getPaymentRegistration(payment)
  const parent = getPaymentParent(payment)

  return (
    auth.isAdmin ||
    registration?.created_by === auth.userId ||
    parent?.created_by === auth.userId
  )
}

function canSeeInstallment(installment: AnyRecord, auth: ReportAuthContext) {
  const payment = getInstallmentPayment(installment)

  return payment ? canSeePayment(payment, auth) : auth.isAdmin
}

function canSeeCall(log: AnyRecord, auth: ReportAuthContext) {
  const lead = getLeadFromCall(log)

  return auth.isAdmin || log.user_id === auth.userId || lead?.assigned_user_id === auth.userId
}

function canSeeTask(task: AnyRecord, auth: ReportAuthContext) {
  const lead = getTaskLead(task)
  const parent = getTaskParent(task)

  return (
    auth.isAdmin ||
    task.assigned_user_id === auth.userId ||
    task.created_by === auth.userId ||
    lead?.assigned_user_id === auth.userId ||
    parent?.created_by === auth.userId
  )
}

function applyProgramFilter(
  program: AnyRecord | null | undefined,
  filters: ReportFilters,
) {
  if (!program) {
    return filters.programId === 'all' && filters.programType === 'all'
  }

  if (filters.programId !== 'all' && program.id !== filters.programId) {
    return false
  }

  if (filters.programType !== 'all' && program.type !== filters.programType) {
    return false
  }

  if (filters.programActive === 'active' && program.is_active === false) {
    return false
  }

  if (filters.programActive === 'passive' && program.is_active !== false) {
    return false
  }

  return true
}

function getPaymentOverdueAmount(payment: AnyRecord) {
  const installments = normalizeArray<AnyRecord>(payment.installments)
  const installmentOverdue = installments
    .filter((installment) => installment.status !== 'odendi' && isOverdue(installment.due_date))
    .reduce((total, installment) => total + toNumber(installment.remaining_amount), 0)

  if (installmentOverdue > 0) {
    return installmentOverdue
  }

  if (payment.payment_status !== 'odendi' && isOverdue(payment.due_date)) {
    return toNumber(payment.remaining_amount)
  }

  return 0
}

function filterPayments(payments: AnyRecord[], filters: ReportFilters) {
  return payments
    .filter((payment) => isDateInRange(payment.payment_date ?? payment.created_at, filters))
    .filter((payment) => applyProgramFilter(getPaymentProgram(payment), filters))
    .filter((payment) =>
      filters.paymentStatus === 'all' ? true : payment.payment_status === filters.paymentStatus,
    )
    .filter((payment) => (filters.onlyOverdue ? getPaymentOverdueAmount(payment) > 0 : true))
    .filter((payment) => (filters.onlyDueToday ? isToday(payment.due_date) : true))
}

function filterInstallments(installments: AnyRecord[], filters: ReportFilters) {
  return installments
    .filter((installment) => isDateInRange(installment.due_date ?? installment.created_at, filters))
    .filter((installment) => applyProgramFilter(getInstallmentProgram(installment), filters))
    .filter((installment) =>
      filters.installmentStatus === 'all'
        ? true
        : installment.status === filters.installmentStatus,
    )
    .filter((installment) => (filters.onlyOverdue ? isOverdue(installment.due_date) : true))
    .filter((installment) => (filters.onlyDueToday ? isToday(installment.due_date) : true))
}

function buildSummary({
  calls,
  leads,
  parents,
  payments,
  registrations,
  students,
  tasks,
  whatsAppLogs,
}: {
  calls: AnyRecord[]
  leads: AnyRecord[]
  parents: AnyRecord[]
  payments: AnyRecord[]
  registrations: AnyRecord[]
  students: AnyRecord[]
  tasks: AnyRecord[]
  whatsAppLogs: AnyRecord[]
}): ReportSummary {
  return {
    cancelledRegistrations: registrations.filter((item) => item.status === 'iptal').length,
    confirmedRegistrations: registrations.filter((item) => item.status === 'kesin_kayit').length,
    dueTodayCalls: calls.filter((item) => isToday(item.next_call_date ?? item.call_date)).length,
    dueTodayTasks: tasks.filter((item) => isToday(item.due_date)).length,
    overdueCalls: calls.filter((item) => isOverdue(item.next_call_date)).length,
    overduePaymentAmount: payments.reduce(
      (total, payment) => total + getPaymentOverdueAmount(payment),
      0,
    ),
    overdueTasks: tasks.filter((item) => item.status !== 'tamamlandi' && isOverdue(item.due_date))
      .length,
    preRegistrations: registrations.filter((item) => item.status === 'on_kayit').length,
    remainingPaymentAmount: payments.reduce(
      (total, payment) => total + toNumber(payment.remaining_amount),
      0,
    ),
    totalCollected: payments.reduce((total, payment) => total + toNumber(payment.paid_amount), 0),
    totalLeads: leads.length,
    totalParents: parents.length,
    totalRegistrations: registrations.length,
    totalStudents: students.length,
    totalWhatsAppOpens: whatsAppLogs.length,
  }
}

function buildProgramRows({
  leads,
  payments,
  programs,
  registrations,
}: {
  leads: AnyRecord[]
  payments: AnyRecord[]
  programs: AnyRecord[]
  registrations: AnyRecord[]
}): ProgramReportRow[] {
  return programs.map((program) => {
    const programRegistrations = registrations.filter((item) => item.program_id === program.id)
    const confirmedRegistrations = programRegistrations.filter(
      (item) => item.status === 'kesin_kayit',
    ).length
    const programPayments = payments.filter((payment) => getPaymentProgram(payment)?.id === program.id)

    return {
      cancelledRegistrations: programRegistrations.filter((item) => item.status === 'iptal').length,
      collectedAmount: programPayments.reduce(
        (total, payment) => total + toNumber(payment.paid_amount),
        0,
      ),
      confirmedRegistrations,
      expectedRevenue: programRegistrations.reduce(
        (total, registration) => total + toNumber(registration.final_price),
        0,
      ),
      fillRate: ratio(confirmedRegistrations, toNumber(program.quota)),
      leadCount: leads.filter((lead) => lead.interested_program_id === program.id).length,
      preRegistrations: programRegistrations.filter((item) => item.status === 'on_kayit').length,
      programId: program.id,
      programName: program.name,
      programType: program.type,
      quota: program.quota,
      remainingAmount: programPayments.reduce(
        (total, payment) => total + toNumber(payment.remaining_amount),
        0,
      ),
    }
  })
}

function buildSalesRows({
  auth,
  calls,
  leads,
  profiles,
  tasks,
  whatsAppLogs,
}: {
  auth: ReportAuthContext
  calls: AnyRecord[]
  leads: AnyRecord[]
  profiles: AnyRecord[]
  tasks: AnyRecord[]
  whatsAppLogs: AnyRecord[]
}): SalesPerformanceReportRow[] {
  const visibleProfiles = auth.isAdmin
    ? profiles
    : profiles.filter((profile) => profile.id === auth.userId)

  return visibleProfiles.map((profile) => {
    const assignedLeads = leads.filter((lead) => lead.assigned_user_id === profile.id)
    const userCalls = calls.filter((call) => call.user_id === profile.id)
    const userTasks = tasks.filter(
      (task) => task.assigned_user_id === profile.id || task.created_by === profile.id,
    )

    return {
      assignedLeadCount: assignedLeads.length,
      calledLeadCount: new Set(userCalls.map((call) => call.lead_id).filter(Boolean)).size,
      completedTaskCount: userTasks.filter((task) => task.status === 'tamamlandi').length,
      conversionRate: ratio(
        assignedLeads.filter((lead) => lead.status === 'kayit_oldu').length,
        assignedLeads.length,
      ),
      infoGivenCount: userCalls.filter((call) => call.call_status === 'bilgi_verildi').length,
      profileId: profile.id,
      profileName: profile.full_name ?? '-',
      registeredLeadCount: assignedLeads.filter((lead) => lead.status === 'kayit_oldu').length,
      taskCount: userTasks.length,
      unreachableCount: userCalls.filter((call) => call.call_status === 'ulasilamadi').length,
      whatsAppOpenCount: whatsAppLogs.filter((log) => log.user_id === profile.id).length,
    }
  })
}

function buildLeadSourceRows({
  leads,
  programsById,
  registrations,
}: {
  leads: AnyRecord[]
  programsById: Map<string, AnyRecord>
  registrations: AnyRecord[]
}): LeadSourceReportRow[] {
  const sources = Array.from(
    new Set(leads.map((lead) => lead.source?.trim() || 'diger')),
  ).sort((first, second) => first.localeCompare(second, 'tr'))

  return sources.map((source) => {
    const sourceLeads = leads.filter((lead) => (lead.source?.trim() || 'diger') === source)
    const sourceLeadIds = new Set(sourceLeads.map((lead) => lead.id))
    const registeredLeadCount = sourceLeads.filter((lead) => lead.status === 'kayit_oldu').length
    const sourceRegistrations = registrations.filter((registration) =>
      registration.source_lead_id ? sourceLeadIds.has(registration.source_lead_id) : false,
    )

    return {
      confirmedRevenue: sourceRegistrations
        .filter((registration) => registration.status === 'kesin_kayit')
        .reduce((total, registration) => total + toNumber(registration.final_price), 0),
      conversionRate: ratio(registeredLeadCount, sourceLeads.length),
      estimatedRevenue: sourceLeads.reduce((total, lead) => {
        const program = lead.interested_program_id
          ? programsById.get(lead.interested_program_id)
          : null

        return total + toNumber(program?.price)
      }, 0),
      leadCount: sourceLeads.length,
      registeredLeadCount,
      source,
    }
  })
}

function buildPaymentRows(payments: AnyRecord[]): PaymentReportRow[] {
  return payments.map((payment) => {
    const parent = getPaymentParent(payment)
    const student = getPaymentStudent(payment)
    const program = getPaymentProgram(payment)

    return {
      dueDate: payment.due_date,
      overdueAmount: getPaymentOverdueAmount(payment),
      paidAmount: toNumber(payment.paid_amount),
      parentName: personName(parent),
      paymentId: payment.id,
      programName: program?.name ?? '-',
      remainingAmount: toNumber(payment.remaining_amount),
      status: payment.payment_status ?? null,
      studentName: personName(student),
      totalAmount: toNumber(payment.total_amount),
    }
  })
}

function buildInstallmentRows(installments: AnyRecord[]): InstallmentReportRow[] {
  return installments.map((installment) => {
    const parent = getInstallmentParent(installment)
    const student = getInstallmentStudent(installment)
    const program = getInstallmentProgram(installment)

    return {
      amount: toNumber(installment.amount),
      dueDate: installment.due_date,
      installmentId: installment.id,
      installmentNo: installment.installment_no,
      paidAmount: toNumber(installment.paid_amount),
      parentName: personName(parent),
      programName: program?.name ?? '-',
      remainingAmount: toNumber(installment.remaining_amount),
      status: installment.status ?? null,
      studentName: personName(student),
    }
  })
}

function buildCallReport(calls: AnyRecord[]) {
  const rows: CallReportRow[] = calls.map((call) => {
    const lead = getLeadFromCall(call)
    const parent = getParentFromCall(call)
    const user = normalizeRelation<AnyRecord>(call.user)
    const person = lead ?? parent

    return {
      callDate: call.call_date,
      callId: call.id,
      nextCallDate: call.next_call_date,
      notes: call.notes,
      personName: personName(person),
      phone: person?.phone ?? '-',
      status: call.call_status ?? null,
      userName: personName(user),
    }
  })

  const summary: CallReportSummary = {
    infoGivenCount: calls.filter((call) => call.call_status === 'bilgi_verildi').length,
    registeredCount: calls.filter((call) => call.call_status === 'kayit_oldu').length,
    repeatCount: calls.filter((call) => call.call_status === 'tekrar_aranacak').length,
    totalCount: calls.length,
    unreachableCount: calls.filter((call) => call.call_status === 'ulasilamadi').length,
  }

  return { rows, summary }
}

function buildTaskReport(tasks: AnyRecord[]) {
  const rows: TaskReportRow[] = tasks.map((task) => {
    const lead = getTaskLead(task)
    const parent = getTaskParent(task)
    const assignedUser = normalizeRelation<AnyRecord>(task.assigned_user)

    return {
      assignedUserName: personName(assignedUser),
      dueDate: task.due_date,
      personName: personName(lead ?? parent),
      priority: task.priority ?? null,
      status: task.status ?? null,
      taskId: task.id,
      title: task.title,
    }
  })

  const summary: TaskReportSummary = {
    cancelledCount: tasks.filter((task) => task.status === 'iptal').length,
    completedCount: tasks.filter((task) => task.status === 'tamamlandi').length,
    overdueCount: tasks.filter((task) => task.status !== 'tamamlandi' && isOverdue(task.due_date))
      .length,
    pendingCount: tasks.filter((task) => task.status === 'bekliyor').length,
    totalCount: tasks.length,
  }

  return { rows, summary }
}

function buildWhatsAppReport(logs: AnyRecord[]) {
  const rows: WhatsAppReportRow[] = logs.map((log) => {
    const template = normalizeRelation<AnyRecord>(log.template)
    const user = normalizeRelation<AnyRecord>(log.user)

    return {
      entityType: log.entity_type ?? '-',
      messagePreview: String(log.message ?? '').slice(0, 90),
      openedAt: log.opened_at,
      phone: log.phone ?? '-',
      templateTitle: template?.title ?? 'Sablonsuz',
      userName: personName(user),
      whatsAppLogId: log.id,
    }
  })
  const templateUsage = groupCount(rows.map((row) => row.templateTitle))
  const userUsage = groupCount(rows.map((row) => row.userName))
  const topTemplate = Array.from(templateUsage.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-'
  const mostActiveUser = Array.from(userUsage.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-'

  const summary: WhatsAppReportSummary = {
    mostActiveUser,
    todayCount: logs.filter((log) => isToday(log.opened_at)).length,
    topTemplate,
    totalCount: logs.length,
  }

  return { rows, summary }
}

function buildCharts({
  leadSourceRows,
  payments,
  programs,
  registrations,
  taskReport,
}: {
  leadSourceRows: LeadSourceReportRow[]
  payments: AnyRecord[]
  programs: AnyRecord[]
  registrations: AnyRecord[]
  taskReport: TaskReportSummary
}): ReportChartsData {
  const monthlyRegistrationCounts = groupCount(
    registrations.map((registration) => getMonthKey(registration.registration_date ?? registration.created_at)),
  )
  const monthlyCollections = new Map<string, number>()
  payments.forEach((payment) => {
    const key = getMonthKey(payment.payment_date ?? payment.created_at)
    monthlyCollections.set(key, (monthlyCollections.get(key) ?? 0) + toNumber(payment.paid_amount))
  })
  const programRegistrations = new Map<string, number>()
  registrations.forEach((registration) => {
    const program = programs.find((item) => item.id === registration.program_id)
    const key = program?.name ?? 'Program yok'
    programRegistrations.set(key, (programRegistrations.get(key) ?? 0) + 1)
  })

  return {
    leadSourceConversions: leadSourceRows.map((row) => ({
      extra: row.leadCount,
      label: row.source,
      value: row.conversionRate,
    })),
    monthlyCollections: mapToChartPoints(monthlyCollections),
    monthlyRegistrations: mapToChartPoints(monthlyRegistrationCounts),
    programRegistrations: mapToChartPoints(programRegistrations),
    taskStatusDistribution: [
      { label: 'Bekleyen', value: taskReport.pendingCount },
      { label: 'Tamamlanan', value: taskReport.completedCount },
      { label: 'Geciken', value: taskReport.overdueCount },
      { label: 'Iptal', value: taskReport.cancelledCount },
    ],
  }
}

export async function fetchReportsData(
  filters: ReportFilters,
  auth: ReportAuthContext,
): Promise<ServiceResult<ReportsData>> {
  const [
    leadsResult,
    parentsResult,
    studentsResult,
    programsResult,
    registrationsResult,
    paymentsResult,
    installmentsResult,
    callsResult,
    tasksResult,
    whatsAppResult,
    profilesResult,
  ] = await Promise.all([
    supabase.from('leads').select('*').order('created_at', { ascending: false }),
    supabase.from('parents').select('*').order('created_at', { ascending: false }),
    supabase.from('students').select('*').order('created_at', { ascending: false }),
    supabase.from('programs').select('*').order('name', { ascending: true }),
    supabase
      .from('registrations')
      .select(
        `
          *,
          parent:parents (id,full_name,phone,created_by),
          student:students (id,full_name),
          program:programs (id,name,type,price,quota,is_active)
        `,
      )
      .order('created_at', { ascending: false }),
    supabase
      .from('payments')
      .select(
        `
          *,
          parent:parents (id,full_name,created_by),
          registration:registrations (
            id,
            parent_id,
            student_id,
            program_id,
            created_by,
            parent:parents (id,full_name,created_by),
            student:students (id,full_name),
            program:programs (id,name,type,is_active)
          ),
          installments:payment_installments (*)
        `,
      )
      .order('created_at', { ascending: false }),
    supabase
      .from('payment_installments')
      .select(
        `
          *,
          payment:payments (
            id,
            parent_id,
            registration_id,
            parent:parents (id,full_name,created_by),
            registration:registrations (
              id,
              created_by,
              parent:parents (id,full_name,created_by),
              student:students (id,full_name),
              program:programs (id,name,type,is_active)
            )
          )
        `,
      )
      .order('due_date', { ascending: true, nullsFirst: false }),
    supabase
      .from('call_logs')
      .select(
        `
          *,
          lead:leads (id,full_name,phone,assigned_user_id,source),
          parent:parents (id,full_name,phone,created_by),
          user:profiles (id,full_name)
        `,
      )
      .order('call_date', { ascending: false }),
    supabase
      .from('tasks')
      .select(
        `
          *,
          related_lead:leads (id,full_name,phone,assigned_user_id),
          related_parent:parents (id,full_name,phone,created_by),
          assigned_user:profiles (id,full_name)
        `,
      )
      .order('due_date', { ascending: true, nullsFirst: false }),
    supabase
      .from('whatsapp_message_logs')
      .select(
        `
          *,
          template:whatsapp_templates (id,title),
          user:profiles (id,full_name)
        `,
      )
      .order('opened_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('id,full_name,phone,role_id,is_active,created_at')
      .order('full_name', { ascending: true }),
  ])

  const firstError = [
    leadsResult.error,
    parentsResult.error,
    studentsResult.error,
    programsResult.error,
    registrationsResult.error,
    paymentsResult.error,
    installmentsResult.error,
    callsResult.error,
    tasksResult.error,
    whatsAppResult.error,
    profilesResult.error,
  ].find(Boolean)

  if (firstError) {
    return { error: 'Rapor verileri alinamadi.' }
  }

  const rawPrograms = ((programsResult.data ?? []) as AnyRecord[]).filter((program) =>
    applyProgramFilter(program, filters),
  )
  const rawLeads = ((leadsResult.data ?? []) as AnyRecord[]).filter((lead) =>
    canSeeLead(lead, auth),
  )
  const rawParents = ((parentsResult.data ?? []) as AnyRecord[]).filter((parent) =>
    canSeeCreatedRecord(parent, auth),
  )
  const rawStudents = ((studentsResult.data ?? []) as AnyRecord[]).filter((student) =>
    canSeeCreatedRecord(student, auth),
  )
  const rawRegistrations = ((registrationsResult.data ?? []) as AnyRecord[])
    .filter((registration) => canSeeRegistration(registration, auth))
    .filter((registration) => applyProgramFilter(getRegistrationProgram(registration), filters))
  const rawPayments = ((paymentsResult.data ?? []) as AnyRecord[])
    .filter((payment) => canSeePayment(payment, auth))
  const rawInstallments = ((installmentsResult.data ?? []) as AnyRecord[]).filter((installment) =>
    canSeeInstallment(installment, auth),
  )
  const rawCalls = ((callsResult.data ?? []) as AnyRecord[]).filter((call) => canSeeCall(call, auth))
  const rawTasks = ((tasksResult.data ?? []) as AnyRecord[]).filter((task) => canSeeTask(task, auth))
  const rawWhatsAppLogs = ((whatsAppResult.data ?? []) as AnyRecord[]).filter(
    (log) => auth.isAdmin || log.user_id === auth.userId,
  )
  const profiles = (profilesResult.data ?? []) as AnyRecord[]
  const programsById = new Map(rawPrograms.map((program) => [program.id, program]))

  const leads = rawLeads
    .filter((lead) => isDateInRange(lead.created_at, filters))
    .filter((lead) => applyProgramFilter(programsById.get(lead.interested_program_id), filters))
  const parents = rawParents.filter((parent) => isDateInRange(parent.created_at, filters))
  const students = rawStudents.filter((student) => isDateInRange(student.created_at, filters))
  const registrations = rawRegistrations.filter((registration) =>
    isDateInRange(registration.registration_date ?? registration.created_at, filters),
  )
  const payments = filterPayments(rawPayments, filters)
  const installments = filterInstallments(rawInstallments, filters)
  const calls = rawCalls.filter((call) => isDateInRange(call.call_date ?? call.created_at, filters))
  const tasks = rawTasks.filter((task) => isDateInRange(task.due_date ?? task.created_at, filters))
  const whatsAppLogs = rawWhatsAppLogs.filter((log) => isDateInRange(log.opened_at, filters))

  const programRows = buildProgramRows({
    leads,
    payments,
    programs: rawPrograms,
    registrations,
  })
  const salesRows = buildSalesRows({
    auth,
    calls,
    leads,
    profiles,
    tasks,
    whatsAppLogs,
  })
  const leadSourceRows = buildLeadSourceRows({
    leads,
    programsById,
    registrations,
  })
  const paymentRows = buildPaymentRows(payments)
  const installmentRows = buildInstallmentRows(installments)
  const callReport = buildCallReport(calls)
  const taskReport = buildTaskReport(tasks)
  const whatsAppReport = buildWhatsAppReport(whatsAppLogs)

  return {
    data: {
      callReport,
      charts: buildCharts({
        leadSourceRows,
        payments,
        programs: rawPrograms,
        registrations,
        taskReport: taskReport.summary,
      }),
      installmentRows,
      leadSourceRows,
      paymentRows,
      programRows,
      salesRows,
      summary: buildSummary({
        calls,
        leads,
        parents,
        payments,
        registrations,
        students,
        tasks,
        whatsAppLogs,
      }),
      taskReport,
      whatsAppReport,
    },
  }
}
