// Streaks: consecutive local calendar days with at least one review.
// No imports: the send-reminders Edge Function (Deno) imports this file directly.

/** A day as 'YYYY-MM-DD' */
export type DayString = string

export interface Streak {
  /** Days in a row up to today, or up to yesterday when today has no review yet */
  current: number
  best: number
  reviewedToday: boolean
}

const DAY_MS = 24 * 60 * 60 * 1000

function shiftDay(day: DayString, days: number): DayString {
  return new Date(Date.parse(`${day}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10)
}

/** The device's local date */
export function localDay(date: Date = new Date()): DayString {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** The date in a given IANA time zone (e.g. 'America/Sao_Paulo') */
export function dayInTimeZone(date: Date, timeZone: string): DayString {
  // en-CA formats dates as YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

export function computeStreak(days: DayString[], today: DayString): Streak {
  const reviewed = new Set(days)
  const reviewedToday = reviewed.has(today)

  let current = 0
  for (let day = reviewedToday ? today : shiftDay(today, -1); reviewed.has(day); day = shiftDay(day, -1)) {
    current += 1
  }

  let best = 0
  let run = 0
  let previous: DayString | null = null
  for (const day of [...reviewed].sort()) {
    run = previous !== null && shiftDay(previous, 1) === day ? run + 1 : 1
    best = Math.max(best, run)
    previous = day
  }

  return { current, best: Math.max(best, current), reviewedToday }
}
