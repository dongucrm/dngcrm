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

export function getDayRange(offsetDays = 0) {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() + offsetDays)

  const end = new Date(start)
  end.setDate(end.getDate() + 1)

  return {
    end: end.toISOString(),
    start: start.toISOString(),
  }
}

export function getCurrentWeekRange() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)

  const day = start.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + mondayOffset)

  const end = new Date(start)
  end.setDate(end.getDate() + 7)

  return {
    end: end.toISOString(),
    start: start.toISOString(),
  }
}

export function getCurrentMonthRange() {
  const start = new Date()
  start.setDate(1)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setMonth(end.getMonth() + 1)

  return {
    end: end.toISOString(),
    start: start.toISOString(),
  }
}

export function isPastDateTimeLocal(value: string) {
  if (!value) {
    return false
  }

  return new Date(value).getTime() < Date.now()
}

export function isToday(value: string | null | undefined) {
  if (!value) {
    return false
  }

  const date = new Date(value)
  const today = new Date()

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

export function isOverdue(value: string | null | undefined) {
  if (!value) {
    return false
  }

  return new Date(value).getTime() < Date.now()
}
