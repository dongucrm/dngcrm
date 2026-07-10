import type { ReportDatePreset, ReportFilters } from './types'

export const reportDatePresetOptions: Array<{
  label: string
  value: ReportDatePreset
}> = [
  { label: 'Bugun', value: 'today' },
  { label: 'Dun', value: 'yesterday' },
  { label: 'Bu hafta', value: 'this_week' },
  { label: 'Bu ay', value: 'this_month' },
  { label: 'Son 30 gun', value: 'last_30_days' },
  { label: 'Bu yil', value: 'this_year' },
  { label: 'Ozel aralik', value: 'custom' },
]

export const reportSectionTitles = {
  calls: 'Arama Raporu',
  installments: 'Taksit Raporu',
  leadSources: 'Lead Kaynak Raporu',
  payments: 'Odeme Raporu',
  programs: 'Program Bazli Rapor',
  sales: 'Satis Personeli Performansi',
  tasks: 'Gorev Raporu',
  whatsapp: 'WhatsApp Raporu',
}

export function getDefaultReportFilters(): ReportFilters {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 29)
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)

  return {
    end: end.toISOString().slice(0, 10),
    installmentStatus: 'all',
    onlyDueToday: false,
    onlyOverdue: false,
    paymentStatus: 'all',
    preset: 'last_30_days',
    programActive: 'all',
    programId: 'all',
    programType: 'all',
    start: start.toISOString().slice(0, 10),
  }
}
