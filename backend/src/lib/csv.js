/**
 * CSV for the inbox export: UTF-8 with a byte-order mark (so Excel reads Marathi correctly), quoted fields,
 * and a leading ' on anything a spreadsheet could run as a formula (= + - @).
 */
const BOM = '﻿'

const cell = (v) => {
  if (v == null) return ''
  let s = Array.isArray(v) ? v.join('; ') : typeof v === 'object' ? JSON.stringify(v) : String(v)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export const toCsv = (columns, docs) => `${BOM}${[columns.join(','), ...docs.map((d) => columns.map((c) => cell(d[c])).join(','))].join('\r\n')}\r\n`
