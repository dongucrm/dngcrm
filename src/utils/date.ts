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

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'short',
  }).format(new Date(value))
}

export function formatMonthLabel(value: string | null | undefined) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('tr-TR', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function getDateRangeForPreset(
  preset:
    | 'custom'
    | 'last_30_days'
    | 'this_month'
    | 'this_week'
    | 'this_year'
    | 'today'
    | 'yesterday',
  customStart: string,
  customEnd: string,
) {
  const start = new Date()
  const end = new Date()

  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)

  if (preset === 'custom') {
    return {
      end: customEnd || end.toISOString().slice(0, 10),
      start: customStart || start.toISOString().slice(0, 10),
    }
  }

  if (preset === 'yesterday') {
    start.setDate(start.getDate() - 1)
    end.setDate(end.getDate() - 1)
  }

  if (preset === 'this_week') {
    const day = start.getDay()
    const mondayOffset = day === 0 ? -6 : 1 - day
    start.setDate(start.getDate() + mondayOffset)
  }

  if (preset === 'this_month') {
    start.setDate(1)
  }

  if (preset === 'last_30_days') {
    start.setDate(start.getDate() - 29)
  }

  if (preset === 'this_year') {
    start.setMonth(0, 1)
  }

  return {
    end: end.toISOString().slice(0, 10),
    start: start.toISOString().slice(0, 10),
  }
}
