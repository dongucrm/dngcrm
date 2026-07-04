import { supabase } from '../../../lib/supabase'
import type {
  CallStatus,
  LeadPriority,
  LeadStatus,
  TaskStatus,
} from '../../../types/database'
import {
  fromDateTimeLocalValue,
  getCurrentWeekRange,
  getDayRange,
} from '../../../utils/date'
import type {
  CallAuthContext,
  CallDashboardMetrics,
  CallFiltersState,
  CallLogFormValues,
  CallLogRecord,
  CallReferences,
  CallTargetRecord,
  CallTaskFormValues,
  LeadStatusFromCallStatus,
} from '../types'

type ServiceResult<T> = {
  data?: T
  error?: string
}

type ChainableQuery<T> = {
  eq: (column: string, value: string) => T
  gte: (column: string, value: string) => T
  lt: (column: string, value: string) => T
}

const leadSelect = `
  *,
  interested_program:programs (
    id,
    name,
    type,
    is_active
  ),
  assigned_user:profiles (
    id,
    full_name,
    phone,
    is_active
  )
`

const callLogSelect = `
  *,
  lead:leads (
    ${leadSelect}
  ),
  parent:parents (
    id,
    full_name,
    phone,
    email
  ),
  user:profiles (
    id,
    full_name,
    phone,
    is_active
  )
`

function cleanText(value: string | null | undefined) {
  const trimmedValue = value?.trim()

  return trimmedValue && trimmedValue.length > 0 ? trimmedValue : null
}

function getDateInputStart(value: string) {
  if (!value) {
    return null
  }

  const date = new Date(`${value}T00:00:00`)

  return date.toISOString()
}

function getDateInputEnd(value: string) {
  if (!value) {
    return null
  }

  const date = new Date(`${value}T00:00:00`)
  date.setDate(date.getDate() + 1)

  return date.toISOString()
}

function normalizeRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

function callStatusToLeadStatus(
  callStatus: CallStatus,
): LeadStatusFromCallStatus {
  if (callStatus === 'tekrar_aranacak') {
    return 'aranacak'
  }

  return callStatus as LeadStatusFromCallStatus
}

function appendCallNote(
  existingNotes: string | null,
  callStatus: CallStatus,
  notes: string,
  callDate: string,
) {
  const dateLabel = new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(callDate))
  const nextNote = `[${dateLabel}] ${callStatus}: ${notes.trim()}`

  return existingNotes ? `${existingNotes}\n\n${nextNote}` : nextNote
}

function applyRoleFilter<T extends ChainableQuery<T>>(
  query: T,
  auth: CallAuthContext,
) {
  if (auth.isSales && auth.userId) {
    return query.eq('assigned_user_id', auth.userId)
  }

  return query
}

function applyCallTargetFilters<T extends ChainableQuery<T>>(
  query: T,
  filters: CallFiltersState,
) {
  let nextQuery = query

  if (filters.programId !== 'all') {
    nextQuery = nextQuery.eq('interested_program_id', filters.programId)
  }

  if (filters.priority !== 'all') {
    nextQuery = nextQuery.eq('priority', filters.priority)
  }

  if (filters.probability !== 'all') {
    nextQuery = nextQuery.eq('probability', filters.probability)
  }

  if (filters.source !== 'all') {
    nextQuery = nextQuery.eq('source', filters.source)
  }

  if (filters.preset === 'today') {
    const range = getDayRange()
    nextQuery = nextQuery
      .gte('next_call_date', range.start)
      .lt('next_call_date', range.end)
  }

  if (filters.preset === 'overdue') {
    nextQuery = nextQuery.lt('next_call_date', new Date().toISOString())
  }

  if (filters.preset === 'tomorrow') {
    const range = getDayRange(1)
    nextQuery = nextQuery
      .gte('next_call_date', range.start)
      .lt('next_call_date', range.end)
  }

  if (filters.preset === 'week') {
    const range = getCurrentWeekRange()
    nextQuery = nextQuery
      .gte('next_call_date', range.start)
      .lt('next_call_date', range.end)
  }

  if (filters.preset === 'unreachable') {
    nextQuery = nextQuery.eq('status', 'ulasilamadi')
  }

  if (filters.preset === 'high_probability') {
    nextQuery = nextQuery.eq('probability', 'yuksek')
  }

  if (filters.preset === 'registered') {
    nextQuery = nextQuery.eq('status', 'kayit_oldu')
  }

  if (filters.preset === 'lost') {
    nextQuery = nextQuery.eq('status', 'vazgecti')
  }

  const dateFrom = getDateInputStart(filters.dateFrom)
  const dateTo = getDateInputEnd(filters.dateTo)

  if (dateFrom) {
    nextQuery = nextQuery.gte('next_call_date', dateFrom)
  }

  if (dateTo) {
    nextQuery = nextQuery.lt('next_call_date', dateTo)
  }

  return nextQuery
}

async function fetchLatestCallLogs(leadIds: string[]) {
  if (leadIds.length === 0) {
    return new Map<string, CallLogRecord>()
  }

  const { data, error } = await supabase
    .from('call_logs')
    .select(callLogSelect)
    .in('lead_id', leadIds)
    .order('call_date', { ascending: false })

  if (error) {
    throw error
  }

  const latestLogs = new Map<string, CallLogRecord>()

  ;((data ?? []) as CallLogRecord[]).forEach((log) => {
    if (log.lead_id && !latestLogs.has(log.lead_id)) {
      latestLogs.set(log.lead_id, log)
    }
  })

  return latestLogs
}

export async function fetchCallReferences(
  auth: CallAuthContext,
): Promise<ServiceResult<CallReferences>> {
  const [programResult, parentResult] = await Promise.all([
    supabase
      .from('programs')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true }),
    supabase
      .from('parents')
      .select('id,full_name,phone,email')
      .order('full_name', { ascending: true }),
  ])

  if (programResult.error) {
    return { error: 'Program listesi alınamadı.' }
  }

  let profileQuery = supabase
    .from('profiles')
    .select('id,full_name,phone,is_active')
    .eq('is_active', true)
    .order('full_name', { ascending: true })

  if (!auth.isAdmin && auth.userId) {
    profileQuery = profileQuery.eq('id', auth.userId)
  }

  let leadQuery = supabase
    .from('leads')
    .select(leadSelect)
    .order('full_name', { ascending: true })

  leadQuery = applyRoleFilter(leadQuery, auth)

  const [profileResult, leadResult] = await Promise.all([profileQuery, leadQuery])

  if (profileResult.error) {
    return { error: 'Personel listesi alınamadı.' }
  }

  if (leadResult.error) {
    return { error: 'Lead listesi alınamadı.' }
  }

  const leads = (leadResult.data ?? []) as CallTargetRecord[]
  const sources = Array.from(
    new Set(leads.map((lead) => lead.source).filter(Boolean) as string[]),
  ).sort((a, b) => a.localeCompare(b, 'tr'))

  return {
    data: {
      leads,
      parents: parentResult.error ? [] : parentResult.data ?? [],
      profiles: profileResult.data ?? [],
      programs: programResult.data ?? [],
      sources,
    },
  }
}

export async function fetchCallTargets(
  filters: CallFiltersState,
  auth: CallAuthContext,
): Promise<ServiceResult<CallTargetRecord[]>> {
  try {
    let query = supabase
      .from('leads')
      .select(leadSelect)
      .order('next_call_date', { ascending: true, nullsFirst: false })

    query = applyRoleFilter(query, auth)
    query = applyCallTargetFilters(query, filters)

    if (auth.isAdmin && filters.userId !== 'all') {
      query = query.eq('assigned_user_id', filters.userId)
    }

    const { data, error } = await query

    if (error) {
      return { error: 'Arama listesi alınamadı.' }
    }

    const targets = (data ?? []) as CallTargetRecord[]
    const latestLogs = await fetchLatestCallLogs(targets.map((lead) => lead.id))
    const mergedTargets = targets
      .map((lead) => ({
        ...lead,
        latest_call_log: latestLogs.get(lead.id) ?? null,
      }))
      .filter((lead) => {
        if (filters.callStatus === 'all') {
          return true
        }

        return lead.latest_call_log?.call_status === filters.callStatus
      })

    return { data: mergedTargets }
  } catch {
    return { error: 'Arama listesi alınamadı.' }
  }
}

export async function fetchCallLogsForLead(
  leadId: string,
): Promise<ServiceResult<CallLogRecord[]>> {
  const { data, error } = await supabase
    .from('call_logs')
    .select(callLogSelect)
    .eq('lead_id', leadId)
    .order('call_date', { ascending: false })

  if (error) {
    return { error: 'Görüşme geçmişi alınamadı.' }
  }

  return { data: (data ?? []) as CallLogRecord[] }
}

export async function saveCallLog(
  values: CallLogFormValues,
  auth: CallAuthContext,
  editingLog?: CallLogRecord | null,
): Promise<ServiceResult<CallLogRecord>> {
  const notes = values.notes.trim()
  const callDate = fromDateTimeLocalValue(values.call_date) ?? new Date().toISOString()
  const nextCallDate = fromDateTimeLocalValue(values.next_call_date) ?? null
  const leadId = values.lead_id || null
  const parentId = values.parent_id || null
  const userId = auth.isAdmin ? values.user_id || auth.userId : auth.userId

  if (!leadId && !parentId) {
    return { error: 'Lead veya veli seçmelisiniz.' }
  }

  if (!userId) {
    return { error: 'Arayan personel seçilemedi.' }
  }

  if (!notes) {
    return { error: 'Görüşme notu boş bırakılamaz.' }
  }

  const payload = {
    call_date: callDate,
    call_status: values.call_status,
    lead_id: leadId,
    next_call_date: nextCallDate,
    notes,
    parent_id: parentId,
    user_id: userId,
  }

  const result = editingLog
    ? await supabase
        .from('call_logs')
        .update(payload)
        .eq('id', editingLog.id)
        .select(callLogSelect)
        .maybeSingle()
    : await supabase
        .from('call_logs')
        .insert(payload)
        .select(callLogSelect)
        .maybeSingle()

  if (result.error || !result.data) {
    return {
      error: editingLog
        ? 'Arama kaydı güncellenemedi.'
        : 'Arama kaydı eklenemedi.',
    }
  }

  if (leadId) {
    const leadUpdate: {
      last_contact_date: string
      next_call_date?: string | null
      notes?: string
      status: LeadStatus
    } = {
      last_contact_date: callDate,
      status: callStatusToLeadStatus(values.call_status),
    }

    if (nextCallDate) {
      leadUpdate.next_call_date = nextCallDate
    }

    if (values.sync_notes_to_lead) {
      const { data: leadData } = await supabase
        .from('leads')
        .select('notes')
        .eq('id', leadId)
        .maybeSingle()

      leadUpdate.notes = appendCallNote(
        leadData?.notes ?? null,
        values.call_status,
        notes,
        callDate,
      )
    }

    await supabase.from('leads').update(leadUpdate).eq('id', leadId)
  }

  return { data: result.data as CallLogRecord }
}

export async function createTaskForLead(
  lead: CallTargetRecord,
  values: CallTaskFormValues,
  auth: CallAuthContext,
): Promise<ServiceResult<null>> {
  const title = values.title.trim()

  if (!title) {
    return { error: 'Görev başlığı zorunludur.' }
  }

  const { error } = await supabase.from('tasks').insert({
    assigned_user_id: lead.assigned_user_id ?? auth.userId,
    description: cleanText(values.description),
    due_date: fromDateTimeLocalValue(values.due_date) ?? null,
    priority: values.priority as LeadPriority,
    related_lead_id: lead.id,
    status: values.status as TaskStatus,
    title,
  })

  if (error) {
    return { error: 'Görev oluşturulamadı.' }
  }

  return { data: null }
}

async function countLeads(
  auth: CallAuthContext,
  build: <T extends ChainableQuery<T>>(query: T) => T,
) {
  let query = supabase
    .from('leads')
    .select('id', { count: 'exact', head: true })

  query = applyRoleFilter(query, auth)
  query = build(query)

  const { count, error } = await query

  if (error) {
    return 0
  }

  return count ?? 0
}

export async function fetchDashboardCallMetrics(
  auth: CallAuthContext,
): Promise<CallDashboardMetrics> {
  const today = getDayRange()

  const [todayCount, overdueCount, unreachableCount, highProbabilityCount] =
    await Promise.all([
      countLeads(auth, (query) =>
        query.gte('next_call_date', today.start).lt('next_call_date', today.end),
      ),
      countLeads(auth, (query) =>
        query.lt('next_call_date', new Date().toISOString()),
      ),
      countLeads(auth, (query) => query.eq('status', 'ulasilamadi')),
      countLeads(auth, (query) => query.eq('probability', 'yuksek')),
    ])

  return {
    highProbabilityCount,
    overdueCount,
    todayCount,
    unreachableCount,
  }
}

export function getCallTargetProgram(target: CallTargetRecord) {
  return normalizeRelation(target.interested_program)
}

export function getCallTargetAssignee(target: CallTargetRecord) {
  return normalizeRelation(target.assigned_user)
}

export function getCallLogUser(log: CallLogRecord) {
  return normalizeRelation(log.user)
}
