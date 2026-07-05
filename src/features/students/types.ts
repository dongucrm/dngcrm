import type {
  DatabaseId,
  Parent,
  Payment,
  PaymentStatus,
  Program,
  Registration,
  Student,
  StudentFormData,
} from '../../types/database'

export type StudentParent = Pick<
  Parent,
  'id' | 'full_name' | 'phone' | 'email' | 'created_by' | 'source_lead_id'
>

export type StudentRegistration = Registration & {
  program?: Pick<Program, 'id' | 'name' | 'type'> | Pick<Program, 'id' | 'name' | 'type'>[] | null
}

export type StudentPayment = Pick<
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
>

export type StudentRecord = Student & {
  parent?: StudentParent | StudentParent[] | null
  registrations?: StudentRegistration[] | null
  payments?: StudentPayment[] | null
  active_program_name: string | null
  active_registration_status: Registration['status']
  total_payment_amount: number
  remaining_payment_amount: number
}

export type StudentFiltersState = {
  search: string
  parentId: DatabaseId | 'all'
  programId: DatabaseId | 'all'
  paymentStatus: PaymentStatus | 'all'
  activeRegistration: 'all' | 'yes' | 'no'
}

export type StudentFormValues = StudentFormData

export type StudentReferences = {
  parents: StudentParent[]
  programs: Pick<Program, 'id' | 'name' | 'type' | 'is_active'>[]
}

export type StudentAuthContext = {
  isAdmin: boolean
  isSales: boolean
  userId: string | null
}
