import { supabase } from '../../../lib/supabase'
import type { LeadPriority, TaskStatus } from '../../../types/database'
import { getCurrentWeekRange, getDayRange } from '../../../utils/date'
import type {
  TaskAuthContext,
  TaskDashboardMetrics,
  TaskFiltersState,
  TaskFormValues,
  TaskRecord,
  TaskReferences,
} from '../types'

type ServiceResult<T> = {
  data?: T
  error?: string
}

const taskSelect = `
  *,
  related_lead:leads (
    id,
    full_name,
    phone,
    child_name,
    interested_program_id,
    assigned_user_id,
    interested_program:programs (
      id,
      name,
      type,
      is_active
    )
  ),
  related_parent:parents (
    id,
    full_name,
    phone,
    email
  ),
  assigned_user:profiles!tasks_assigned_user_id_fkey (
    id,
    full_name,
    phone,
    is_active
  )
`

const leadReferenceSelect = `
  id,
  full_name,
  phone,
  child_name,
  interested_program_id,
  assigned_user_id,
  interested_program:programs (
    id,
    name,
    type,
    is_active
  )
`

function cleanText(value: string | null | undefined) {
  const trimmedValue = value?.trim()

  return trimmedValue && trimmedValue.length > 0 ? trimmedValue : null
}

function normalizeRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

function applyRoleFilter(query: any, auth: TaskAuthContext) {
  if (auth.isSales && auth.userId) {
    return query.eq('assigned_user_id', auth.userId)
  }

  return query
}

function applyTaskFilters(
  query: any,
  filters: TaskFiltersState,
  auth: TaskAuthContext,
) {
  let nextQuery = query

  if (filters.search.trim()) {
    const searchValue = filters.search.trim().replaceAll(',', ' ')
    nextQuery = nextQuery.or(
      `title.ilike.%${searchValue}%,description.ilike.%${searchValue}%`,
    )
  }

  if (filters.status !== 'all') {
    nextQuery = nextQuery.eq('status', filters.status)
  }

  if (filters.priority !== 'all') {
    nextQuery = nextQuery.eq('priority', filters.priority)
  }

  if (filters.userId !== 'all') {
    nextQuery = nextQuery.eq('assigned_user_id', filters.userId)
  }

  if (filters.preset === 'today') {
    const range = getDayRange()
    nextQuery = nextQuery.gte('due_date', range.start).lt('due_date', range.end)
  }

  if (filters.preset === 'overdue') {
    nextQuery = nextQuery
      .lt('due_date', new Date().toISOString())
      .neq('status', 'tamamlandi')
  }

  if (filters.preset === 'tomorrow') {
    const range = getDayRange(1)
    nextQuery = nextQuery.gte('due_date', range.start).lt('due_date', range.end)
  }

  if (filters.preset === 'week') {
    const range = getCurrentWeekRange()
    nextQuery = nextQuery.gte('due_date', range.start).lt('due_date', range.end)
  }

  if (filters.preset === 'completed') {
    nextQuery = nextQuery.eq('status', 'tamamlandi')
  }

  if (filters.preset === 'pending') {
    nextQuery = nextQuery.eq('status', 'bekliyor')
  }

  if (filters.preset === 'cancelled') {
    nextQuery = nextQuery.eq('status', 'iptal')
  }

  if (filters.preset === 'high') {
    nextQuery = nextQuery.eq('priority', 'yuksek')
  }

  if (filters.preset === 'assigned_to_me') {
    if (auth.userId) {
      nextQuery = nextQuery.eq('assigned_user_id', auth.userId)
    }
  }

  return nextQuery
}

function buildTaskPayload(
  values: TaskFormValues,
  auth: TaskAuthContext,
  editingTask?: TaskRecord | null,
) {
  const assignedUserId = auth.isAdmin
    ? values.assigned_user_id || null
    : editingTask?.assigned_user_id ?? auth.userId

  return {
    assigned_user_id: assignedUserId,
    description: cleanText(values.description),
    due_date: values.due_date || null,
    priority: values.priority,
    related_lead_id: values.related_lead_id || null,
    related_parent_id: values.related_parent_id || null,
    status: values.status,
    title: values.title.trim(),
  }
}

export function getTaskLead(task: TaskRecord) {
  return normalizeRelation(task.related_lead)
}

export function getTaskParent(task: TaskRecord) {
  return normalizeRelation(task.related_parent)
}

export function getTaskAssignee(task: TaskRecord) {
  return normalizeRelation(task.assigned_user)
}

export function getTaskProgram(task: TaskRecord) {
  return normalizeRelation(getTaskLead(task)?.interested_program)
}

export function getTaskPersonName(task: TaskRecord) {
  return getTaskLead(task)?.full_name ?? getTaskParent(task)?.full_name ?? '-'
}

export function canEditTask(task: TaskRecord, auth: TaskAuthContext) {
  return Boolean(auth.isAdmin || (auth.userId && task.created_by === auth.userId))
}

export function canCompleteTask(task: TaskRecord, auth: TaskAuthContext) {
  return Boolean(
    auth.isAdmin ||
      (auth.userId &&
        (task.assigned_user_id === auth.userId || task.created_by === auth.userId)),
  )
}

export async function fetchTaskReferences(
  auth: TaskAuthContext,
): Promise<ServiceResult<TaskReferences>> {
  let leadQuery = supabase
    .from('leads')
    .select(leadReferenceSelect)
    .order('full_name', { ascending: true })

  leadQuery = applyRoleFilter(leadQuery, auth)

  let profileQuery = supabase
    .from('profiles')
    .select('id,full_name,phone,is_active')
    .eq('is_active', true)
    .order('full_name', { ascending: true })

  if (!auth.isAdmin && auth.userId) {
    profileQuery = profileQuery.eq('id', auth.userId)
  }

  const [leadResult, parentResult, profileResult] = await Promise.all([
    leadQuery,
    supabase
      .from('parents')
      .select('id,full_name,phone,email')
      .order('full_name', { ascending: true }),
    profileQuery,
  ])

  if (leadResult.error) {
    return { error: 'Lead listesi alınamadı.' }
  }

  if (profileResult.error) {
    return { error: 'Personel listesi alınamadı.' }
  }

  return {
    data: {
      leads: leadResult.data ?? [],
      parents: parentResult.error ? [] : parentResult.data ?? [],
      profiles: profileResult.data ?? [],
    },
  }
}

export async function fetchTasks(
  filters: TaskFiltersState,
  auth: TaskAuthContext,
): Promise<ServiceResult<TaskRecord[]>> {
  let query = supabase
    .from('tasks')
    .select(taskSelect)
    .order('due_date', { ascending: true, nullsFirst: false })

  query = applyRoleFilter(query, auth)
  query = applyTaskFilters(query, filters, auth)

  const { data, error } = await query

  if (error) {
    return { error: 'Görev listesi alınamadı.' }
  }

  return { data: (data ?? []) as TaskRecord[] }
}

export async function fetchTasksForLead(
  leadId: string,
  auth: TaskAuthContext,
): Promise<ServiceResult<TaskRecord[]>> {
  let query = supabase
    .from('tasks')
    .select(taskSelect)
    .eq('related_lead_id', leadId)
    .order('due_date', { ascending: true, nullsFirst: false })

  query = applyRoleFilter(query, auth)

  const { data, error } = await query

  if (error) {
    return { error: 'Lead görevleri alınamadı.' }
  }

  return { data: (data ?? []) as TaskRecord[] }
}

export async function saveTask(
  values: TaskFormValues,
  auth: TaskAuthContext,
  editingTask?: TaskRecord | null,
): Promise<ServiceResult<TaskRecord>> {
  if (!values.title.trim()) {
    return { error: 'Başlık zorunludur.' }
  }

  if (!values.due_date) {
    return { error: 'Son tarih zorunludur.' }
  }

  if (!values.assigned_user_id && auth.isAdmin) {
    return { error: 'Atanan personel zorunludur.' }
  }

  if (!auth.userId) {
    return { error: 'Oturum kullanıcısı bulunamadı.' }
  }

  const payload = buildTaskPayload(values, auth, editingTask)

  const result = editingTask
    ? await supabase
        .from('tasks')
        .update(payload)
        .eq('id', editingTask.id)
        .select(taskSelect)
        .maybeSingle()
    : await supabase
        .from('tasks')
        .insert({
          ...payload,
          created_by: auth.userId,
        })
        .select(taskSelect)
        .maybeSingle()

  if (result.error || !result.data) {
    return {
      error: editingTask
        ? 'Görev güncellenemedi.'
        : 'Görev oluşturulamadı.',
    }
  }

  return { data: result.data as TaskRecord }
}

export async function completeTask(
  task: TaskRecord,
): Promise<ServiceResult<null>> {
  const { error } = await supabase
    .from('tasks')
    .update({ status: 'tamamlandi' satisfies TaskStatus })
    .eq('id', task.id)

  if (error) {
    return { error: 'Görev tamamlandı yapılamadı.' }
  }

  return { data: null }
}

export async function cancelTask(task: TaskRecord): Promise<ServiceResult<null>> {
  const { error } = await supabase
    .from('tasks')
    .update({ status: 'iptal' satisfies TaskStatus })
    .eq('id', task.id)

  if (error) {
    return { error: 'Görev iptal edilemedi.' }
  }

  return { data: null }
}

async function countTasks(auth: TaskAuthContext, build: (query: any) => any) {
  let query = supabase.from('tasks').select('id', { count: 'exact', head: true })

  query = applyRoleFilter(query, auth)
  query = build(query)

  const { count, error } = await query

  if (error) {
    return 0
  }

  return count ?? 0
}

export async function fetchTaskDashboardMetrics(
  auth: TaskAuthContext,
): Promise<TaskDashboardMetrics> {
  const today = getDayRange()

  const [
    todayCount,
    overdueCount,
    pendingCount,
    completedCount,
    highPriorityCount,
  ] = await Promise.all([
    countTasks(auth, (query) =>
      query.gte('due_date', today.start).lt('due_date', today.end),
    ),
    countTasks(auth, (query) =>
      query
        .lt('due_date', new Date().toISOString())
        .neq('status', 'tamamlandi'),
    ),
    countTasks(auth, (query) => query.eq('status', 'bekliyor')),
    countTasks(auth, (query) => query.eq('status', 'tamamlandi')),
    countTasks(auth, (query) => query.eq('priority', 'yuksek')),
  ])

  return {
    completedCount,
    highPriorityCount,
    overdueCount,
    pendingCount,
    todayCount,
  }
}

export async function fetchTodayTasks(
  auth: TaskAuthContext,
  limit = 5,
): Promise<ServiceResult<TaskRecord[]>> {
  const range = getDayRange()

  let query = supabase
    .from('tasks')
    .select(taskSelect)
    .gte('due_date', range.start)
    .lt('due_date', range.end)
    .neq('status', 'tamamlandi')
    .order('due_date', { ascending: true })
    .limit(limit)

  query = applyRoleFilter(query, auth)

  const { data, error } = await query

  if (error) {
    return { error: 'Bugünkü görevler alınamadı.' }
  }

  return { data: (data ?? []) as TaskRecord[] }
}

export function createTaskValuesFromLead(leadId: string, assignedUserId?: string) {
  return {
    assigned_user_id: assignedUserId,
    description: '',
    due_date: '',
    priority: 'orta' as LeadPriority,
    related_lead_id: leadId,
    status: 'bekliyor' as TaskStatus,
    title: '',
  }
}

export function createTaskValuesFromParent(parentId: string, assignedUserId?: string) {
  return {
    assigned_user_id: assignedUserId,
    description: '',
    due_date: '',
    priority: 'orta' as LeadPriority,
    related_parent_id: parentId,
    status: 'bekliyor' as TaskStatus,
    title: '',
  }
}

export function toTaskFormValues(task: TaskRecord): TaskFormValues {
  return {
    assigned_user_id: task.assigned_user_id ?? undefined,
    created_by: task.created_by ?? undefined,
    description: task.description ?? '',
    due_date: task.due_date ?? undefined,
    priority: task.priority ?? 'orta',
    related_lead_id: task.related_lead_id ?? undefined,
    related_parent_id: task.related_parent_id ?? undefined,
    status: task.status ?? 'bekliyor',
    title: task.title,
  }
}
