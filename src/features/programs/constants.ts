import type { ProgramType } from '../../types/database'

export const programTypeOptions: ProgramType[] = [
  'kamp',
  'kurs',
  'atolye',
  'yetiskin_egitimi',
  'diger',
]

export const emptyProgramFilters = {
  dateFrom: '',
  dateTo: '',
  isActive: 'all',
  search: '',
  type: 'all',
} as const
