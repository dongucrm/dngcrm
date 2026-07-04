import type {
  CallStatus,
  LeadPriority,
  LeadProbability,
  LeadStatus,
  PaymentMethod,
  PaymentStatus,
  ProgramType,
  RegistrationStatus,
  TaskStatus,
} from '../types/database'

export const programTypeLabels: Record<ProgramType, string> = {
  kamp: 'Kamp',
  atolye: 'Atölye',
  egitim: 'Eğitim',
  danismanlik: 'Danışmanlık',
  etkinlik: 'Etkinlik',
}

export const leadStatusLabels: Record<LeadStatus, string> = {
  yeni_lead: 'Yeni Lead',
  aranacak: 'Aranacak',
  arandi: 'Arandı',
  ulasilamadi: 'Ulaşılamadı',
  takipte: 'Takipte',
  teklif_verildi: 'Teklif Verildi',
  kayit_oldu: 'Kayıt Oldu',
  kaybedildi: 'Kaybedildi',
}

export const leadPriorityLabels: Record<LeadPriority, string> = {
  dusuk: 'Düşük',
  orta: 'Orta',
  yuksek: 'Yüksek',
}

export const leadProbabilityLabels: Record<LeadProbability, string> = {
  dusuk: 'Düşük',
  orta: 'Orta',
  yuksek: 'Yüksek',
}

export const registrationStatusLabels: Record<RegistrationStatus, string> = {
  on_kayit: 'Ön Kayıt',
  kesin_kayit: 'Kesin Kayıt',
  iptal: 'İptal',
  tamamlandi: 'Tamamlandı',
}

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  odenmedi: 'Ödenmedi',
  kismi_odendi: 'Kısmi Ödendi',
  odendi: 'Ödendi',
  gecikti: 'Gecikti',
  iptal: 'İptal',
}

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  nakit: 'Nakit',
  kredi_karti: 'Kredi Kartı',
  havale: 'Havale',
  eft: 'EFT',
  online: 'Online',
  diger: 'Diğer',
}

export const taskStatusLabels: Record<TaskStatus, string> = {
  bekliyor: 'Bekliyor',
  devam_ediyor: 'Devam Ediyor',
  tamamlandi: 'Tamamlandı',
  iptal: 'İptal',
}

export const callStatusLabels: Record<CallStatus, string> = {
  aranacak: 'Aranacak',
  arandi: 'Arandı',
  ulasilamadi: 'Ulaşılamadı',
  mesgul: 'Meşgul',
  geri_donulecek: 'Geri Dönülecek',
  kayit_oldu: 'Kayıt Oldu',
}
