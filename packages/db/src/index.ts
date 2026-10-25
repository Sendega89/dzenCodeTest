import { existsSync } from 'node:fs'
import path from 'node:path'
import { createBlobRepo, createJsonRepo, createMemoryRepo, type Repo } from './json-repo'
import { createMysqlRepo } from './mysql-repo'

function repoRoot(): string {
  let dir = process.cwd()
  for (let hop = 0; hop < 6; hop += 1) {
    if (existsSync(path.join(dir, 'schema', 'inventory.sql'))) return dir
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return process.cwd()
}

const globalStore = globalThis as typeof globalThis & { __inventoryRepo?: Repo }

export function createRepo(): Repo {
  const databaseUrl = process.env.DATABASE_URL
  if (databaseUrl && databaseUrl.startsWith('mysql')) return createMysqlRepo(databaseUrl)
  if (process.env.BLOB_READ_WRITE_TOKEN) return createBlobRepo()
  const file =
    process.env.DATA_FILE ||
    (process.env.VERCEL ? path.join('/tmp', 'inventory.json') : path.join(repoRoot(), 'data', 'inventory.json'))
  return createJsonRepo(file)
}

export async function loadSnapshot() {
  const gateway = process.env.GATEWAY_URL?.replace(/\/$/, '')
  if (!gateway) return getRepo().snapshot()
  const response = await fetch(`${gateway}/api/snapshot`, { cache: 'no-store' })
  if (!response.ok) throw new Error(`gateway snapshot failed: ${response.status}`)
  return response.json() as Promise<import('@inventory/domain').Snapshot>
}

export function getRepo(): Repo {
  if (!globalStore.__inventoryRepo) globalStore.__inventoryRepo = createRepo()
  return globalStore.__inventoryRepo
}

export { createMemoryRepo, createJsonRepo, createMysqlRepo }
export type { Repo } from './json-repo'
export { FieldValidationError, NotFoundError } from './apply'
export { createInventoryYoga } from './graphql'
