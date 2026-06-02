export function exportToCsv(filename, rows, headers) {
  const escape = val => {
    if (val == null) return ''
    const str = String(val).replace(/"/g, '""')
    return str.includes(',') || str.includes('\n') || str.includes('"') ? `"${str}"` : str
  }
  const lines = [
    headers.map(escape).join(','),
    ...rows.map(row => row.map(escape).join(','))
  ]
  const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
