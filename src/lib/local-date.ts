/** Local calendar date as YYYY-MM-DD (not UTC). */
export function localDateIso(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Parse YYYY-MM-DD as local noon to avoid DST edge cases. */
export function parseLocalDate(iso: string): Date {
  return new Date(`${iso}T12:00:00`)
}
