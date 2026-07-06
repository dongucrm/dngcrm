import type {
  PaymentInstallmentStatus,
  PaymentMethod,
  PaymentStatus,
} from '../../types/database'

export const paymentStatusOptions: PaymentStatus[] = [
  'odenmedi',
  'kismi_odendi',
  'odendi',
  'gecikti',
  'iptal',
]

export const paymentMethodOptions: PaymentMethod[] = [
  'nakit',
  'kredi_karti',
  'havale',
  'eft',
  'online',
  'diger',
]

export const paymentInstallmentStatusOptions: PaymentInstallmentStatus[] = [
  'bekliyor',
  'kismi_odendi',
  'odendi',
  'gecikti',
  'iptal',
]

export const emptyPaymentFilters = {
  dateFrom: '',
  dateTo: '',
  method: 'all',
  preset: 'all',
  programId: 'all',
  search: '',
  status: 'all',
} as const
