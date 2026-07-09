import type { DatabaseId, Timestamp, WhatsAppTemplate } from '../../types/database'

export type WhatsAppTemplateCategory =
  | 'lead'
  | 'veli'
  | 'ogrenci'
  | 'kayit'
  | 'odeme'
  | 'taksit'
  | 'deneme_dersi'
  | 'hatirlatma'
  | 'genel'

export type WhatsAppTemplateRecord = WhatsAppTemplate & {
  category: WhatsAppTemplateCategory | string | null
}

export type WhatsAppTemplateFormValues = {
  category: WhatsAppTemplateCategory
  is_active: boolean
  message: string
  title: string
}

export type WhatsAppTemplateFiltersState = {
  category: WhatsAppTemplateCategory | 'all'
  search: string
  status: 'active' | 'all' | 'passive'
}

export type WhatsAppMessageEntityType =
  | 'lead'
  | 'parent'
  | 'student'
  | 'registration'
  | 'payment'
  | 'task'
  | 'call_log'

export type WhatsAppTemplateVariables = Record<
  string,
  number | string | null | undefined
>

export type WhatsAppMessageTarget = {
  defaultCategory?: WhatsAppTemplateCategory
  entityId: DatabaseId
  entityType: WhatsAppMessageEntityType
  name: string
  phone?: string | null
  variables?: WhatsAppTemplateVariables
}

export type WhatsAppMessageLog = {
  entity_id: DatabaseId | null
  entity_type: string | null
  id: DatabaseId
  message: string | null
  opened_at: Timestamp | null
  phone: string | null
  template_id: DatabaseId | null
  user_id: DatabaseId | null
}

export type WhatsAppDashboardMetrics = {
  passiveTemplateCount: number
  todayOpenCount: number
  topTemplateTitle: string
  totalOpenCount: number
}

export type WhatsAppAuthContext = {
  isAdmin: boolean
  isSales: boolean
  userId: DatabaseId | null
}
