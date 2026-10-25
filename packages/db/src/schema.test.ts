import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { SCHEMA_SQL } from './schema'

describe('mysql schema', () => {
  it('matches the Workbench script', () => {
    const file = readFileSync(new URL('../../../schema/inventory.sql', import.meta.url), 'utf8')
    const normalize = (value: string) => value.replace(/--.*$/gm, '').replace(/\s+/g, ' ').trim()
    expect(normalize(file)).toBe(normalize(SCHEMA_SQL))
  })
})
