import type {
  DatabaseId,
  Lead,
  LeadProbability,
  LeadStatus,
  Parent,
  Payment,
  Program,
  ProgramFormData,
  ProgramType,
  Registration,
  RegistrationStatus,
  Student,
} from '../../types/database'

export type ProgramRegistration = Registration & {
  parent?: Pick<Parent, 'id' | 'full_name' | 'phone' | 'email'> | Pick<Parent, 'id' | 'full_name' | 'phone' | 'email'>[] | null
  student?: Pick<Student, 'id' | 'full_name'> | Pick<Student, 'id' | 'full_name'>[] | null
  payments?: Pick<Payment, 'id' | 'paid_amount' | 'remaining_amount' | 'total_amount' | 'payment_status'>[] | null
}

export type ProgramLead = Pick<
  Lead,
  | 'id'
  | 'assigned_user_id'
  | 'child_name'
  | 'full_name'
  | 'phone'
  | 'probability'
  | 'status'
>

export type ProgramSummary = {
  cancelledCount: number
  confirmedCount: number
  expectedIncome: number
  fillRate: number
  paidAmount: number
  preRegistrationCount: number
  registeredCount: number
  remainingAmount: number
  remainingQuota: number | null
}

export type ProgramRecord = Program &
  ProgramSummary & {
    leads?: ProgramLead[] | null
    registrations?: ProgramRegistration[] | null
  }

export type ProgramFiltersState = {
  dateFrom: string
  dateTo: string
  isActive: 'all' | 'active' | 'passive'
  search: string
  type: ProgramType | 'all'
}

export type ProgramFormValues = ProgramFormData

export type ProgramDashboardMetrics = {
  activePrograms: number
  cancelledRegistrations: number
  confirmedRegistrations: number
  highestFillProgram: {
    fillRate: number
    name: string
  } | null
  preRegistrations: number
  programsNearCapacity: ProgramRecord[]
  recentRegistrations: ProgramRegistration[]
  registrationsThisMonth: number
  totalPrograms: number
  totalRegistrations: number
}

export type ProgramAuthContext = {
  isAdmin: boolean
  isSales: boolean
  userId: DatabaseId | null
}

export type ProgramRegistrationStatus = RegistrationStatus
export type ProgramLeadStatus = LeadStatus
export type ProgramLeadProbability = LeadProbability
