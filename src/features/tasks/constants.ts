import type { LeadPriority, TaskStatus } from '../../types/database'
import type { TaskFilterPreset } from './types'

export const taskStatusOptions: TaskStatus[] = [
  'bekliyor',
  'tamamlandi',
  'iptal',
]

export const taskPriorityOptions: LeadPriority[] = ['dusuk', 'orta', 'yuksek']

export const taskFilterPresetOptions: Array<{
  label: string
  value: TaskFilterPreset
}> = [
  { label: 'Tüm görevler', value: 'all' },
  { label: 'Bugünkü görevler', value: 'today' },
  { label: 'Geciken görevler', value: 'overdue' },
  { label: 'Yarınki görevler', value: 'tomorrow' },
  { label: 'Bu haftaki görevler', value: 'week' },
  { label: 'Tamamlanan görevler', value: 'completed' },
  { label: 'Bekleyen görevler', value: 'pending' },
  { label: 'İptal edilen görevler', value: 'cancelled' },
  { label: 'Yüksek öncelikli görevler', value: 'high' },
  { label: 'Bana atanmış görevler', value: 'assigned_to_me' },
]

export const emptyTaskFilters = {
  preset: 'today',
  priority: 'all',
  search: '',
  status: 'all',
  userId: 'all',
} as const
