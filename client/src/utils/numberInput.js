export function clampNumberInput(value, { min = 0, max, integer = false } = {}) {
  if (value === '') return ''

  const raw = String(value).trim().replace(',', '.')
  if (raw === '' || raw === '-' || raw === '+') return ''
  if (raw.startsWith('-')) return String(min ?? 0)

  const number = Number(raw)
  if (!Number.isFinite(number)) return ''

  let next = integer ? Math.trunc(number) : number
  if (min !== undefined && next < min) next = min
  if (max !== undefined && next > max) next = max

  const plainDecimal = /^[0-9]*\.?[0-9]*$/.test(raw)
  const clamped = next !== number
  if (!integer && plainDecimal && !clamped) return raw

  return String(next)
}

export function toBoundedNumber(value, { min = 0, max, fallback = min ?? 0, integer = false } = {}) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback

  let next = integer ? Math.trunc(number) : number
  if (min !== undefined && next < min) next = min
  if (max !== undefined && next > max) next = max
  return next
}
