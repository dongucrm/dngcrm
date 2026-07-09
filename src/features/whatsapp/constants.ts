import type { WhatsAppTemplateCategory } from './types'

export const whatsappTemplateCategories: WhatsAppTemplateCategory[] = [
  'lead',
  'veli',
  'ogrenci',
  'kayit',
  'odeme',
  'taksit',
  'deneme_dersi',
  'hatirlatma',
  'genel',
]

export const whatsappTemplateCategoryLabels: Record<
  WhatsAppTemplateCategory,
  string
> = {
  deneme_dersi: 'Deneme Dersi',
  genel: 'Genel',
  hatirlatma: 'Hatırlatma',
  kayit: 'Kayıt',
  lead: 'Lead',
  odeme: 'Ödeme',
  ogrenci: 'Öğrenci',
  taksit: 'Taksit',
  veli: 'Veli',
}

export const templateVariablesByCategory: Record<
  WhatsAppTemplateCategory,
  string[]
> = {
  deneme_dersi: [
    'veli_adi',
    'ogrenci_adi',
    'program_adi',
    'bugunun_tarihi',
  ],
  genel: ['kurum_adi', 'telefon', 'bugunun_tarihi', 'veli_adi'],
  hatirlatma: [
    'veli_adi',
    'ogrenci_adi',
    'program_adi',
    'sonraki_arama_tarihi',
    'bugunun_tarihi',
  ],
  kayit: [
    'veli_adi',
    'ogrenci_adi',
    'program_adi',
    'kayit_durumu',
    'kayit_tarihi',
    'net_fiyat',
  ],
  lead: [
    'veli_adi',
    'telefon',
    'cocuk_adi',
    'cocuk_yasi',
    'program_adi',
    'kaynak',
    'sonraki_arama_tarihi',
  ],
  odeme: [
    'veli_adi',
    'ogrenci_adi',
    'program_adi',
    'toplam_tutar',
    'odenen_tutar',
    'kalan_tutar',
    'en_yakin_odeme_tarihi',
    'geciken_tutar',
  ],
  ogrenci: ['veli_adi', 'ogrenci_adi', 'ogrenci_yasi', 'veli_telefonu'],
  taksit: [
    'veli_adi',
    'program_adi',
    'taksit_no',
    'taksit_tutari',
    'taksit_kalan_tutar',
    'vade_tarihi',
    'taksit_durumu',
  ],
  veli: ['veli_adi', 'ogrenci_adi', 'ogrenci_yasi', 'veli_telefonu'],
}

export const emptyWhatsAppTemplateFilters = {
  category: 'all',
  search: '',
  status: 'all',
} as const
