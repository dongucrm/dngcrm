type ExportRow = Record<string, string | number | null | undefined>

function csvEscape(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return ''
  }

  const text = String(value)

  if (/[",\n\r;]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`
  }

  return text
}

export function exportCsv(filename: string, rows: ExportRow[]) {
  if (rows.length === 0) {
    return
  }

  const headers = Object.keys(rows[0])
  const lines = [
    headers.map(csvEscape).join(';'),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(';')),
  ]
  const blob = new Blob([`\uFEFF${lines.join('\r\n')}`], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
