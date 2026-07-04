import type {
  DatabaseId,
  Lead,
  LeadPriority,
  Parent,
  Profile,
  Program,
  Task,
  TaskFormData,
  TaskStatus,
} from '../../types/database'

export type TaskProgram = Pick<Program, 'id' | 'name' | 'type' | 'is_active'>
export type TaskProfile = Pick<Profile, 'id' | 'full_name' | 'phone' | 'is_active'>
export type TaskParent = Pick<Parent, 'id' | 'full_name' | 'phone' | 'email'>
export type TaskLead = Pick<
  Lead,
  | 'id'
  | 'full_name'
  | 'phone'
  | 'child_name'
  | 'interested_program_id'
  | 'assigned_user_id'
> & {
  interested_program?: TaskProgram | TaskProgram[] | null
}

export type TaskRecord = Task & {
  related_lead?: TaskLead | TaskLead[] | null
  related_parent?: TaskParent | TaskParent[] | null
  assigned_user?: TaskProfile | TaskProfile[] | null
  created_by_user?: TaskProfile | TaskProfile[] | null
}

export type TaskFilterPreset =
  | 'all'
  | 'today'
  | 'overdue'
  | 'tomorrow'
  | 'week'
  | 'completed'
  | 'pending'
  | 'cancelled'
  | 'high'
  | 'assigned_to_me'

export type TaskFiltersState = {
  preset: TaskFilterPreset
  status: TaskStatus | 'all'
  priority: LeadPriority | 'all'
  userId: DatabaseId | 'all'
  search: string
}

export type TaskFormValues = TaskFormData

export type TaskReferences = {
  leads: TaskLead[]
  parents: TaskParent[]
  profiles: TaskProfile[]
}

export type TaskAuthContext = {
  isAdmin: boolean
  isSales: boolean
  userId: string | null
}

export type TaskDashboardMetrics = {
  todayCount: number
  overdueCount: number
  pendingCount: number
  completedCount: number
  highPriorityCount: number
}
