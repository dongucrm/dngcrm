export type DatabaseId = string
export type Timestamp = string
export type DateString = string
export type AppRole = 'admin' | 'satis_personeli'

export type ProgramType =
  | 'kamp'
  | 'kurs'
  | 'atolye'
  | 'yetiskin_egitimi'
  | 'diger'
  | 'egitim'
  | 'danismanlik'
  | 'etkinlik'

export type LeadStatus =
  | 'yeni_lead'
  | 'aranacak'
  | 'arandi'
  | 'ulasilamadi'
  | 'bilgi_verildi'
  | 'deneme_dersine_davet'
  | 'deneme_dersine_katildi'
  | 'kayit_dusunuyor'
  | 'odeme_bekleniyor'
  | 'kayit_oldu'
  | 'vazgecti'

export type LeadPriority = 'dusuk' | 'orta' | 'yuksek'
export type LeadProbability = 'dusuk' | 'orta' | 'yuksek'
export type RegistrationStatus =
  | 'on_kayit'
  | 'kesin_kayit'
  | 'iptal'
  | 'tamamlandi'
export type PaymentStatus =
  | 'odenmedi'
  | 'kismi_odendi'
  | 'odendi'
  | 'gecikti'
  | 'iptal'
export type PaymentMethod =
  | 'nakit'
  | 'kredi_karti'
  | 'havale'
  | 'eft'
  | 'online'
  | 'diger'
export type TaskStatus =
  | 'bekliyor'
  | 'tamamlandi'
  | 'iptal'
export type CallStatus =
  | 'aranacak'
  | 'arandi'
  | 'ulasilamadi'
  | 'bilgi_verildi'
  | 'tekrar_aranacak'
  | 'deneme_dersine_davet'
  | 'kayit_dusunuyor'
  | 'odeme_bekleniyor'
  | 'kayit_oldu'
  | 'vazgecti'

export type Role = {
  id: DatabaseId
  name: AppRole | string
  description: string | null
  created_at: Timestamp | null
}

export type Profile = {
  id: DatabaseId
  full_name: string | null
  phone: string | null
  role_id: DatabaseId | null
  is_active: boolean | null
  created_at: Timestamp | null
}

export type Program = {
  id: DatabaseId
  name: string
  type: ProgramType
  description: string | null
  notes: string | null
  price: number | null
  start_date: DateString | null
  end_date: DateString | null
  quota: number | null
  is_active: boolean | null
  created_at: Timestamp | null
}

export type Lead = {
  id: DatabaseId
  full_name: string
  phone: string
  email: string | null
  child_name: string | null
  child_age: number | null
  source: string | null
  interested_program_id: DatabaseId | null
  status: LeadStatus | null
  priority: LeadPriority | null
  probability: LeadProbability | null
  assigned_user_id: DatabaseId | null
  next_call_date: Timestamp | null
  last_contact_date: Timestamp | null
  notes: string | null
  created_at: Timestamp | null
  updated_at: Timestamp | null
}

export type Parent = {
  id: DatabaseId
  full_name: string
  phone: string
  email: string | null
  address: string | null
  notes: string | null
  created_by: DatabaseId | null
  source_lead_id: DatabaseId | null
  created_at: Timestamp | null
}

export type Student = {
  id: DatabaseId
  parent_id: DatabaseId | null
  full_name: string
  age: number | null
  birth_date: DateString | null
  school: string | null
  notes: string | null
  created_by: DatabaseId | null
  source_lead_id: DatabaseId | null
  created_at: Timestamp | null
}

export type Registration = {
  id: DatabaseId
  parent_id: DatabaseId | null
  student_id: DatabaseId | null
  program_id: DatabaseId | null
  status: RegistrationStatus | null
  registration_date: DateString | null
  total_price: number | null
  discount_amount: number | null
  final_price: number | null
  notes: string | null
  created_by: DatabaseId | null
  source_lead_id: DatabaseId | null
  created_at: Timestamp | null
}

export type Payment = {
  id: DatabaseId
  registration_id: DatabaseId | null
  parent_id: DatabaseId | null
  total_amount: number | null
  paid_amount: number | null
  remaining_amount: number | null
  payment_method: PaymentMethod | null
  installment_count: number | null
  payment_status: PaymentStatus | null
  due_date: DateString | null
  payment_date: DateString | null
  notes: string | null
  created_at: Timestamp | null
}

export type CallLog = {
  id: DatabaseId
  lead_id: DatabaseId | null
  parent_id: DatabaseId | null
  user_id: DatabaseId | null
  call_status: CallStatus | null
  call_date: Timestamp | null
  next_call_date: Timestamp | null
  notes: string | null
  created_at: Timestamp | null
}

export type Task = {
  id: DatabaseId
  title: string
  description: string | null
  related_lead_id: DatabaseId | null
  related_parent_id: DatabaseId | null
  assigned_user_id: DatabaseId | null
  created_by: DatabaseId | null
  due_date: Timestamp | null
  status: TaskStatus | null
  priority: LeadPriority | null
  created_at: Timestamp | null
}

export type WhatsAppTemplate = {
  id: DatabaseId
  title: string
  message: string
  category: string | null
  is_active: boolean | null
  created_at: Timestamp | null
}

export type Note = {
  id: DatabaseId
  entity_type: string
  entity_id: DatabaseId
  user_id: DatabaseId | null
  note: string
  created_at: Timestamp | null
}

export type AuditLog = {
  id: DatabaseId
  user_id: DatabaseId | null
  action: string | null
  table_name: string | null
  record_id: DatabaseId | null
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  created_at: Timestamp | null
}

export type LeadFormData = {
  full_name: string
  phone: string
  email?: string
  child_name?: string
  child_age?: number
  source?: string
  interested_program_id?: DatabaseId
  status: LeadStatus
  priority: LeadPriority
  probability: LeadProbability
  assigned_user_id?: DatabaseId
  next_call_date?: Timestamp
  last_contact_date?: Timestamp
  notes?: string
}

export type ParentFormData = {
  full_name: string
  phone: string
  email?: string
  address?: string
  notes?: string
  created_by?: DatabaseId
  source_lead_id?: DatabaseId
}

export type StudentFormData = {
  parent_id?: DatabaseId
  full_name: string
  age?: number
  birth_date?: DateString
  school?: string
  notes?: string
  created_by?: DatabaseId
  source_lead_id?: DatabaseId
}

export type ProgramFormData = {
  name: string
  type: ProgramType
  description?: string
  notes?: string
  price?: number
  start_date?: DateString
  end_date?: DateString
  quota?: number
  is_active: boolean
}

export type RegistrationFormData = {
  parent_id?: DatabaseId
  student_id?: DatabaseId
  program_id?: DatabaseId
  status: RegistrationStatus
  registration_date?: DateString
  total_price?: number
  discount_amount?: number
  final_price?: number
  notes?: string
  created_by?: DatabaseId
  source_lead_id?: DatabaseId
}

export type PaymentFormData = {
  registration_id?: DatabaseId
  parent_id?: DatabaseId
  total_amount?: number
  paid_amount?: number
  remaining_amount?: number
  payment_method?: PaymentMethod
  installment_count: number
  payment_status: PaymentStatus
  due_date?: DateString
  payment_date?: DateString
  notes?: string
}

export type TaskFormData = {
  title: string
  description?: string
  related_lead_id?: DatabaseId
  related_parent_id?: DatabaseId
  assigned_user_id?: DatabaseId
  created_by?: DatabaseId
  due_date?: Timestamp
  status: TaskStatus
  priority: LeadPriority
}
