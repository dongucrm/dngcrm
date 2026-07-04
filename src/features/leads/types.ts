import type {
  DatabaseId,
  Lead,
  LeadFormData,
  LeadPriority,
  LeadProbability,
  LeadStatus,
  Profile,
  Program,
  TaskStatus,
} from '../../types/database'

export type LeadProgram = Pick<Program, 'id' | 'name' | 'type' | 'is_active'>
export type LeadAssignee = Pick<
  Profile,
  'id' | 'full_name' | 'phone' | 'is_active'
>

export type LeadRecord = Lead & {
  interested_program?: LeadProgram | LeadProgram[] | null
  assigned_user?: LeadAssignee | LeadAssignee[] | null
}

export type LeadFilters = {
  search: string
  status: LeadStatus | 'all'
  programId: DatabaseId | 'all'
  source: string
  priority: LeadPriority | 'all'
  probability: LeadProbability | 'all'
  callFilter: 'all' | 'today' | 'overdue'
}

export type LeadFormValues = LeadFormData

export type LeadQuickAction =
  | {
      type: 'call'
      lead: LeadRecord
    }
  | {
      type: 'task'
      lead: LeadRecord
    }

export type CallLogFormValues = {
  call_status: string
  next_call_date: string
  notes: string
}

export type LeadTaskFormValues = {
  title: string
  description: string
  due_date: string
  priority: LeadPriority
  status: TaskStatus
}
