import type { Locale } from './types'

const MONTHS: Record<Locale, string[]> = {
  ru: ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}

const WEEKDAYS: Record<Locale, string[]> = {
  ru: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
}

export function dateParts(value: string): { year: string; month: number; day: string } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!match) return null
  const month = Number(match[2])
  if (!month || month > 12) return null
  return { year: match[1] ?? '', month, day: match[3] ?? '' }
}

function monthLabel(locale: Locale, month: number): string {
  const raw = MONTHS[locale][month - 1] ?? ''
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

export function formatShortDate(value: string): string {
  const parts = dateParts(value)
  if (!parts) return value
  return `${parts.day}/${String(parts.month).padStart(2, '0')}`
}

export function formatLongDate(value: string, locale: Locale): string {
  const parts = dateParts(value)
  if (!parts) return value
  return `${parts.day} / ${monthLabel(locale, parts.month)} / ${parts.year}`
}

export function formatHeaderDate(date: Date, locale: Locale): string {
  const day = String(date.getDate()).padStart(2, '0')
  return `${day} ${monthLabel(locale, date.getMonth() + 1)}, ${date.getFullYear()}`
}

export function formatClock(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function dayCaption(date: Date, locale: Locale, todayLabel: string): string {
  const now = new Date()
  const same =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  if (same) return todayLabel
  return WEEKDAYS[locale][date.getDay()] ?? todayLabel
}

export function todayStamp(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
