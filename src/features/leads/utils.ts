import type { LeadAssignee, LeadProgram, LeadRecord } from './types'

export function normalizeRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

export function getLeadProgram(lead: LeadRecord): LeadProgram | null {
  return normalizeRelation(lead.interested_program)
}

export function getLeadAssignee(lead: LeadRecord): LeadAssignee | null {
  return normalizeRelation(lead.assigned_user)
}

export function formatNullableDateTime(value: string | null | undefined) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function toDateTimeLocalValue(value: string | null | undefined) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)

  return localDate.toISOString().slice(0, 16)
}

export function fromDateTimeLocalValue(value: string | undefined) {
  if (!value) {
    return undefined
  }

  return new Date(value).toISOString()
}

export function formatPhoneForDisplay(phone: string | null | undefined) {
  if (!phone) {
    return '-'
  }

  return phone
}

export function normalizeTurkeyPhoneForWhatsApp(phone: string) {
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

export function getWhatsAppUrl(phone: string) {
  const normalizedPhone = normalizeTurkeyPhoneForWhatsApp(phone)

  if (!normalizedPhone) {
    return null
  }

  return `https://wa.me/${normalizedPhone}`
}

export function getTodayRange() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(end.getDate() + 1)

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  }
}
