import type {
  CallLog,
  CallStatus,
  DatabaseId,
  Lead,
  LeadPriority,
  LeadProbability,
  LeadStatus,
  Parent,
  Profile,
  Program,
  TaskStatus,
} from '../../types/database'

export type CallProgram = Pick<Program, 'id' | 'name' | 'type' | 'is_active'>
export type CallProfile = Pick<Profile, 'id' | 'full_name' | 'phone' | 'is_active'>
export type CallParent = Pick<Parent, 'id' | 'full_name' | 'phone' | 'email'>

export type CallLead = Lead & {
  interested_program?: CallProgram | CallProgram[] | null
  assigned_user?: CallProfile | CallProfile[] | null
}

export type CallLogRecord = CallLog & {
  lead?: CallLead | CallLead[] | null
  parent?: CallParent | CallParent[] | null
  user?: CallProfile | CallProfile[] | null
}

export type CallTargetRecord = CallLead & {
  latest_call_log?: CallLogRecord | null
}

export type CallFilterPreset =
  | 'all'
  | 'today'
  | 'overdue'
  | 'tomorrow'
  | 'week'
  | 'unreachable'
  | 'high_probability'
  | 'registered'
  | 'lost'

export type CallFiltersState = {
  dateFrom: string
  dateTo: string
  callStatus: CallStatus | 'all'
  programId: DatabaseId | 'all'
  userId: DatabaseId | 'all'
  priority: LeadPriority | 'all'
  probability: LeadProbability | 'all'
  source: string
  preset: CallFilterPreset
}

export type CallLogFormValues = {
  lead_id: string
  parent_id: string
  user_id: string
  call_status: CallStatus
  call_date: string
  next_call_date: string
  notes: string
  sync_notes_to_lead: boolean
}

export type CallTaskFormValues = {
  title: string
  description: string
  due_date: string
  priority: LeadPriority
  status: TaskStatus
}

export type CallReferences = {
  leads: CallTargetRecord[]
  parents: CallParent[]
  profiles: CallProfile[]
  programs: Program[]
  sources: string[]
}

export type CallDashboardMetrics = {
  todayCount: number
  overdueCount: number
  unreachableCount: number
  highProbabilityCount: number
}

export type CallAuthContext = {
  isAdmin: boolean
  isSales: boolean
  userId: string | null
}

export type LeadStatusFromCallStatus = Extract<
  LeadStatus,
  | 'aranacak'
  | 'arandi'
  | 'ulasilamadi'
  | 'bilgi_verildi'
  | 'deneme_dersine_davet'
  | 'kayit_dusunuyor'
  | 'odeme_bekleniyor'
  | 'kayit_oldu'
  | 'vazgecti'
>
