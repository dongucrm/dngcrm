type ExportRow = Record<string, string | number | null | undefined>

function htmlEscape(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return ''
  }

  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export async function exportExcel(
  filename: string,
  rows: ExportRow[],
  sheetName = 'Rapor',
) {
  if (rows.length === 0) {
    return
  }

  const headers = Object.keys(rows[0])
  const headerCells = headers.map((header) => `<th>${htmlEscape(header)}</th>`).join('')
  const bodyRows = rows
    .map((row) => {
      const cells = headers
        .map((header) => `<td>${htmlEscape(row[header])}</td>`)
        .join('')

      return `<tr>${cells}</tr>`
    })
    .join('')
  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${htmlEscape(sheetName)}</title>
      </head>
      <body>
        <table>
          <thead><tr>${headerCells}</tr></thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </body>
    </html>
  `
  const blob = new Blob([`\uFEFF${html}`], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.xls`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
