import type {
  CallStatus,
  LeadPriority,
  LeadProbability,
  LeadStatus,
  TaskStatus,
} from '../../types/database'

export const leadStatusOptions: LeadStatus[] = [
  'yeni_lead',
  'aranacak',
  'arandi',
  'ulasilamadi',
  'bilgi_verildi',
  'deneme_dersine_davet',
  'deneme_dersine_katildi',
  'kayit_dusunuyor',
  'odeme_bekleniyor',
  'kayit_oldu',
  'vazgecti',
]

export const leadPriorityOptions: LeadPriority[] = ['dusuk', 'orta', 'yuksek']
export const leadProbabilityOptions: LeadProbability[] = [
  'dusuk',
  'orta',
  'yuksek',
]

export const callStatusOptions: CallStatus[] = [
  'aranacak',
  'arandi',
  'ulasilamadi',
  'mesgul',
  'geri_donulecek',
  'kayit_oldu',
]

export const taskStatusOptions: TaskStatus[] = [
  'bekliyor',
  'devam_ediyor',
  'tamamlandi',
  'iptal',
]

export const leadSourceOptions = [
  'web_form',
  'instagram',
  'telefon',
  'whatsapp',
  'referans',
  'etkinlik',
  'diger',
]

export const emptyLeadFilters = {
  search: '',
  status: 'all',
  programId: 'all',
  source: 'all',
  priority: 'all',
  probability: 'all',
  callFilter: 'all',
} as const
