export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = Math.floor(minutes % 60) // ← tambah Math.floor
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function formatTime(ms: number): string {
  const d = new Date(ms)
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

function toLocalDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatDate(dateStr: string): string {
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (dateStr === toLocalDateString(today)) return 'Today'
  if (dateStr === toLocalDateString(yesterday)) return 'Yesterday'

  const [y, mo, d] = dateStr.split('-').map(Number)
  const date = new Date(y, mo - 1, d)
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}
