export function normalizeTurkeyPhone(phone: string) {
  let digits = phone.replace(/\D/g, '')

  if (digits.startsWith('00')) {
    digits = digits.slice(2)
  }

  if (digits.startsWith('90') && digits.length === 12) {
    return digits
  }

  if (digits.startsWith('0') && digits.length === 11) {
    return `90${digits.slice(1)}`
  }

  if (digits.length === 10) {
    return `90${digits}`
  }

  if (digits.length > 10 && digits.startsWith('90')) {
    return digits
  }

  return null
}

export function getWhatsAppUrl(phone: string | null | undefined) {
  if (!phone) {
    return null
  }

  const normalizedPhone = normalizeTurkeyPhone(phone)

  if (!normalizedPhone) {
    return null
  }

  return `https://wa.me/${normalizedPhone}`
}

export function formatPhoneForDisplay(phone: string | null | undefined) {
  return phone || '-'
}
