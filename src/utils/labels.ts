import type {
  CallStatus,
  LeadPriority,
  LeadProbability,
  LeadStatus,
  PaymentMethod,
  PaymentInstallmentStatus,
  PaymentStatus,
  ProgramType,
  RegistrationStatus,
  TaskStatus,
} from '../types/database'

export const programTypeLabels: Record<ProgramType, string> = {
  kamp: 'Kamp',
  kurs: 'Kurs',
  atolye: 'At?lye',
  yetiskin_egitimi: 'Yeti?kin E?itimi',
  diger: 'Di?er',
  egitim: 'E?itim',
  danismanlik: 'Dan??manl?k',
  etkinlik: 'Etkinlik',
}

export const leadStatusLabels: Record<LeadStatus, string> = {
  yeni_lead: 'Yeni Lead',
  aranacak: 'Aranacak',
  arandi: 'Arandı',
  ulasilamadi: 'Ulaşılamadı',
  bilgi_verildi: 'Bilgi Verildi',
  deneme_dersine_davet: 'Deneme Dersine Davet',
  deneme_dersine_katildi: 'Deneme Dersine Katıldı',
  kayit_dusunuyor: 'Kayıt Düşünüyor',
  odeme_bekleniyor: 'Ödeme Bekleniyor',
  kayit_oldu: 'Kayıt Oldu',
  vazgecti: 'Vazgeçti',
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

export const paymentInstallmentStatusLabels: Record<
  PaymentInstallmentStatus,
  string
> = {
  bekliyor: 'Bekliyor',
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
  tamamlandi: 'Tamamlandı',
  iptal: 'İptal',
}

export const callStatusLabels: Record<CallStatus, string> = {
  aranacak: 'Aranacak',
  arandi: 'Arandı',
  ulasilamadi: 'Ulaşılamadı',
  bilgi_verildi: 'Bilgi Verildi',
  tekrar_aranacak: 'Tekrar Aranacak',
  deneme_dersine_davet: 'Deneme Dersine Davet',
  kayit_dusunuyor: 'Kayıt Düşünüyor',
  odeme_bekleniyor: 'Ödeme Bekleniyor',
  kayit_oldu: 'Kayıt Oldu',
  vazgecti: 'Vazgeçti',
}
