import type {
  DatabaseId,
  Parent,
  Payment,
  PaymentInstallment,
  Program,
  Registration,
  RegistrationFormData,
  RegistrationStatus,
  Student,
  Task,
  WhatsAppTemplate,
} from '../../types/database'

export type RegistrationParent = Pick<
  Parent,
  'id' | 'full_name' | 'phone' | 'email'
>

export type RegistrationStudent = Pick<
  Student,
  'id' | 'parent_id' | 'full_name' | 'age' | 'school'
>

export type RegistrationProgram = Pick<
  Program,
  'id' | 'name' | 'type' | 'price' | 'quota' | 'is_active'
>

export type RegistrationPayment = Pick<
  Payment,
  | 'id'
  | 'registration_id'
  | 'parent_id'
  | 'total_amount'
  | 'paid_amount'
  | 'remaining_amount'
  | 'payment_method'
  | 'payment_status'
  | 'due_date'
  | 'payment_date'
  | 'created_at'
> & {
  installments?: PaymentInstallment[] | null
}

export type RegistrationTask = Pick<
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

export type RegistrationRecord = Registration & {
  parent?: RegistrationParent | RegistrationParent[] | null
  payments?: RegistrationPayment[] | null
  program?: RegistrationProgram | RegistrationProgram[] | null
  student?: RegistrationStudent | RegistrationStudent[] | null
  tasks?: RegistrationTask[] | null
  paid_amount: number
  remaining_amount: number
}

export type RegistrationFiltersState = {
  dateFrom: string
  dateTo: string
  programId: DatabaseId | 'all'
  search: string
  status: RegistrationStatus | 'all'
}

export type RegistrationFormValues = RegistrationFormData

export type RegistrationReferences = {
  parents: RegistrationParent[]
  programs: RegistrationProgram[]
  students: RegistrationStudent[]
  whatsappTemplates: WhatsAppTemplate[]
}

export type RegistrationAuthContext = {
  isAdmin: boolean
  isSales: boolean
  userId: DatabaseId | null
}

export type RegistrationSaveOptions = {
  allowCapacityOverride?: boolean
}

export type RegistrationDashboardSlice = {
  recentRegistrations: RegistrationRecord[]
}
