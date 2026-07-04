import type {
  CallStatus,
  LeadPriority,
  LeadProbability,
  TaskStatus,
} from '../../types/database'
import type { CallFilterPreset } from './types'

export const callStatusOptions: CallStatus[] = [
  'aranacak',
  'arandi',
  'ulasilamadi',
  'bilgi_verildi',
  'tekrar_aranacak',
  'deneme_dersine_davet',
  'kayit_dusunuyor',
  'odeme_bekleniyor',
  'kayit_oldu',
  'vazgecti',
]

export const callPresetOptions: Array<{
  label: string
  value: CallFilterPreset
}> = [
  { label: 'Tüm aramalar', value: 'all' },
  { label: 'Bugün aranacaklar', value: 'today' },
  { label: 'Geciken aramalar', value: 'overdue' },
  { label: 'Yarın aranacaklar', value: 'tomorrow' },
  { label: 'Bu hafta aranacaklar', value: 'week' },
  { label: 'Ulaşılamayanlar', value: 'unreachable' },
  { label: 'Kayıt ihtimali yüksek', value: 'high_probability' },
  { label: 'Kayıt oldu', value: 'registered' },
  { label: 'Vazgeçti', value: 'lost' },
]

export const leadPriorityOptions: LeadPriority[] = ['dusuk', 'orta', 'yuksek']
export const leadProbabilityOptions: LeadProbability[] = [
  'dusuk',
  'orta',
  'yuksek',
]

export const taskStatusOptions: TaskStatus[] = [
  'bekliyor',
  'tamamlandi',
  'iptal',
]

export const emptyCallFilters = {
  callStatus: 'all',
  dateFrom: '',
  dateTo: '',
  priority: 'all',
  probability: 'all',
  programId: 'all',
  preset: 'today',
  source: 'all',
  userId: 'all',
} as const
