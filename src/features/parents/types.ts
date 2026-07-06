import type {
  CallLog,
  DatabaseId,
  Parent,
  ParentFormData,
  Payment,
  PaymentInstallment,
  PaymentStatus,
  Program,
  Registration,
  Student,
  Task,
  WhatsAppTemplate,
} from '../../types/database'

export type ParentStudent = Student

export type ParentRegistration = Registration & {
  program?: Pick<Program, 'id' | 'name' | 'type'> | Pick<Program, 'id' | 'name' | 'type'>[] | null
  student?: Pick<Student, 'id' | 'full_name'> | Pick<Student, 'id' | 'full_name'>[] | null
}

export type ParentPayment = Pick<
  Payment,
  | 'id'
  | 'parent_id'
  | 'registration_id'
  | 'total_amount'
  | 'paid_amount'
  | 'remaining_amount'
  | 'payment_status'
  | 'due_date'
  | 'payment_date'
  | 'created_at'
> & {
  installments?: PaymentInstallment[] | null
}

export type ParentCallLog = Pick<
  CallLog,
  'id' | 'parent_id' | 'user_id' | 'call_status' | 'call_date' | 'next_call_date' | 'notes' | 'created_at'
> & {
  user?: { id: string; full_name: string | null } | { id: string; full_name: string | null }[] | null
}

export type ParentTask = Pick<
  Task,
  | 'id'
  | 'title'
  | 'description'
  | 'related_parent_id'
  | 'assigned_user_id'
  | 'created_by'
  | 'due_date'
  | 'status'
  | 'priority'
  | 'created_at'
>

export type ParentRecord = Parent & {
  students?: ParentStudent[] | null
  registrations?: ParentRegistration[] | null
  payments?: ParentPayment[] | null
  call_logs?: ParentCallLog[] | null
  tasks?: ParentTask[] | null
  student_count: number
  active_registration_count: number
  total_payment_amount: number
  remaining_payment_amount: number
  last_contact_date: string | null
}

export type ParentFiltersState = {
  search: string
  programId: DatabaseId | 'all'
  paymentStatus: PaymentStatus | 'all'
  activeRegistration: 'all' | 'yes' | 'no'
}

export type ParentFormValues = ParentFormData

export type ParentReferences = {
  programs: Pick<Program, 'id' | 'name' | 'type' | 'is_active'>[]
  whatsappTemplates: WhatsAppTemplate[]
}

export type ParentAuthContext = {
  isAdmin: boolean
  isSales: boolean
  userId: string | null
}

export type ParentDashboardMetrics = {
  totalParents: number
  totalStudents: number
  activeStudents: number
  parentsThisMonth: number
  studentsThisMonth: number
}
