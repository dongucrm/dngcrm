import type { RegistrationStatus } from '../../types/database'

export const registrationStatusOptions: RegistrationStatus[] = [
  'on_kayit',
  'kesin_kayit',
  'iptal',
  'tamamlandi',
]

export const activeRegistrationStatuses: RegistrationStatus[] = [
  'on_kayit',
  'kesin_kayit',
]

export const emptyRegistrationFilters = {
  dateFrom: '',
  dateTo: '',
  programId: 'all',
  search: '',
  status: 'all',
} as const
