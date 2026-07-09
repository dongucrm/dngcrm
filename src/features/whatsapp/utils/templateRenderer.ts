import type { WhatsAppTemplateVariables } from '../types'

const defaultValues: Record<string, string> = {
  bugunun_tarihi: new Intl.DateTimeFormat('tr-TR').format(new Date()),
  cocuk_adi: 'Öğrencimiz',
  cocuk_yasi: '-',
  en_yakin_odeme_tarihi: '-',
  geciken_tutar: '-',
  kalan_tutar: '-',
  kayit_durumu: '-',
  kayit_tarihi: '-',
  kaynak: '-',
  kurum_adi: 'Döngü CRM',
  net_fiyat: '-',
  odenen_tutar: '-',
  ogrenci_adi: 'Öğrencimiz',
  ogrenci_yasi: '-',
  program_adi: 'Programımız',
  sonraki_arama_tarihi: '-',
  taksit_durumu: '-',
  taksit_kalan_tutar: '-',
  taksit_no: '-',
  taksit_tutari: '-',
  telefon: '-',
  toplam_tutar: '-',
  vade_tarihi: '-',
  veli_adi: 'Velimiz',
  veli_telefonu: '-',
}

function normalizeValue(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  return String(value)
}

export function renderWhatsAppTemplate(
  template: string,
  variables: WhatsAppTemplateVariables = {},
) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
    return normalizeValue(variables[key]) ?? defaultValues[key] ?? '-'
  })
}

export function buildPreviewVariables(
  variables: WhatsAppTemplateVariables = {},
): WhatsAppTemplateVariables {
  return {
    ...defaultValues,
    ...Object.fromEntries(
      Object.entries(variables).map(([key, value]) => [
        key,
        normalizeValue(value) ?? defaultValues[key] ?? '-',
      ]),
    ),
  }
}
