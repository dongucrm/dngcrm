import type {
  DatabaseId,
  Parent,
  Payment,
  PaymentFormData,
  PaymentInstallment,
  PaymentMethod,
  PaymentStatus,
  Program,
  Registration,
  Student,
  Task,
  WhatsAppTemplate,
} from '../../types/database'

export type PaymentParent = Pick<Parent, 'id' | 'full_name' | 'phone' | 'email'>

export type PaymentStudent = Pick<
  Student,
  'id' | 'parent_id' | 'full_name' | 'age' | 'school'
>

export type PaymentProgram = Pick<
  Program,
  'id' | 'name' | 'type' | 'price' | 'quota' | 'is_active'
>

export type PaymentRegistration = Pick<
  Registration,
  | 'id'
  | 'parent_id'
  | 'student_id'
  | 'program_id'
  | 'status'
  | 'registration_date'
  | 'total_price'
  | 'discount_amount'
  | 'final_price'
> & {
  parent?: PaymentParent | PaymentParent[] | null
  program?: PaymentProgram | PaymentProgram[] | null
  student?: PaymentStudent | PaymentStudent[] | null
}

export type PaymentTask = Pick<
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

export type PaymentRecord = Payment & {
  installments?: PaymentInstallment[] | null
  parent?: PaymentParent | PaymentParent[] | null
  registration?: PaymentRegistration | PaymentRegistration[] | null
  tasks?: PaymentTask[] | null
  nearest_due_date: string | null
  overdue_amount: number
  paid_installment_count: number
}

export type PaymentFiltersState = {
  dateFrom: string
  dateTo: string
  method: PaymentMethod | 'all'
  preset: 'all' | 'today' | 'overdue'
  programId: DatabaseId | 'all'
  search: string
  status: PaymentStatus | 'all'
}

export type PaymentFormValues = PaymentFormData

export type PaymentReferences = {
  registrations: PaymentRegistration[]
  whatsappTemplates: WhatsAppTemplate[]
}

export type PaymentAuthContext = {
  isAdmin: boolean
  isSales: boolean
  userId: DatabaseId | null
}

export type CollectPaymentValues = {
  amount: number
  installment_id: DatabaseId
  notes?: string
  paid_date?: string
}

export type PaymentDashboardMetrics = {
  collectedThisMonth: number
  overdueAmount: number
  overduePayments: PaymentRecord[]
  remainingAmount: number
  todayDueCount: number
  todayDuePayments: PaymentRecord[]
  totalCollected: number
  totalExpected: number
}
