import { describe, expect, it } from 'vitest'
import { formatClock, formatHeaderDate, formatLongDate, formatShortDate } from './dates'

describe('dates', () => {
  it('keeps the calendar day from the date string', () => {
    expect(formatShortDate('2017-10-06')).toBe('06/10')
    expect(formatLongDate('2017-10-06', 'ru')).toBe('06 / Окт / 2017')
    expect(formatLongDate('2017-10-06', 'en')).toBe('06 / Oct / 2017')
  })

  it('formats the live clock with seconds', () => {
    const date = new Date(2017, 2, 12, 17, 20, 9)
    expect(formatClock(date)).toBe('17:20:09')
    expect(formatHeaderDate(date, 'ru')).toBe('12 Мар, 2017')
  })
})
