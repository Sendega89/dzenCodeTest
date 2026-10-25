import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { project, type DbState, type DomainEvent, type SessionUser, type Snapshot } from '@inventory/domain'
import {
  createOrder,
  createProduct,
  deleteOrder,
  deleteProduct,
  emptyState,
  leavePresence,
  markEventsProcessed,
  seededState,
  touchPresence,
} from './apply'
import { verifyPassword } from './password'

export type Repo = {
  init(): Promise<void>
  snapshot(now?: number): Promise<Snapshot>
  authenticate(login: string, password: string): Promise<SessionUser | null>
  createOrder(input: unknown): Promise<Snapshot>
  deleteOrder(id: number): Promise<Snapshot>
  createProduct(input: unknown): Promise<Snapshot>
  deleteProduct(id: number): Promise<Snapshot>
  touchPresence(clientId: string, now?: number): Promise<Snapshot>
  leavePresence(clientId: string): Promise<Snapshot>
  pullEvents(limit?: number): Promise<DomainEvent[]>
  markEvents(ids: number[]): Promise<void>
}

type Store = {
  read(): Promise<DbState>
  write(next: DbState): Promise<void>
}

function queue(store: Store) {
  let chain: Promise<unknown> = Promise.resolve()
  return async function update(mutator: (state: DbState) => DbState | Promise<DbState>): Promise<Snapshot> {
    const run = chain.then(async () => {
      const current = await store.read()
      const next = await mutator(current)
      await store.write(next)
      return project(next)
    })
    chain = run.then(
      () => undefined,
      () => undefined,
    )
    return run
  }
}

function repoFrom(store: Store, ready: () => Promise<void>): Repo {
  const update = queue(store)
  return {
    init: ready,
    async snapshot(now) {
      await ready()
      return project(await store.read(), now)
    },
    async authenticate(login, password) {
      await ready()
      const state = await store.read()
      const user = state.users.find((item) => item.login === login)
      if (!user) return null
      const ok = await verifyPassword(password, user.passwordHash)
      if (!ok) return null
      return { id: user.id, name: user.name, login: user.login }
    },
    createOrder: (input) => update((state) => createOrder(state, input)),
    deleteOrder: (id) => update((state) => deleteOrder(state, id)),
    createProduct: (input) => update((state) => createProduct(state, input)),
    deleteProduct: (id) => update((state) => deleteProduct(state, id)),
    touchPresence: (clientId, now) => update((state) => touchPresence(state, clientId, now)),
    leavePresence: (clientId) => update((state) => leavePresence(state, clientId)),
    async pullEvents(limit = 50) {
      await ready()
      return (await store.read()).outbox.filter((event) => !event.processedAt).slice(0, limit)
    },
    async markEvents(ids) {
      await update((state) => markEventsProcessed(state, ids))
    },
  }
}

async function ensureSeed(store: Store): Promise<void> {
  const current = await store.read()
  if (current.orders.length === 0 && current.users.length === 0) {
    await store.write(await seededState())
  }
}

export function createMemoryRepo(initial?: DbState): Repo {
  let state = initial ?? emptyState()
  const store: Store = {
    async read() {
      return structuredClone(state)
    },
    async write(next) {
      state = structuredClone(next)
    },
  }
  return repoFrom(store, async () => {
    if (state.users.length === 0) state = await seededState()
  })
}

export function createJsonRepo(file: string): Repo {
  const store: Store = {
    async read() {
      try {
        const raw = await readFile(file, 'utf8')
        return JSON.parse(raw) as DbState
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return emptyState()
        throw error
      }
    },
    async write(next) {
      await mkdir(path.dirname(file), { recursive: true })
      const temp = `${file}.${process.pid}.tmp`
      await writeFile(temp, JSON.stringify(next))
      await rename(temp, file)
    },
  }
  return repoFrom(store, () => ensureSeed(store))
}

export function createBlobRepo(): Repo {
  const pathname = 'inventory.json'
  let cache: DbState | null = null
  const store: Store = {
    async read() {
      if (cache) return structuredClone(cache)
      const { get } = await import('@vercel/blob')
      const blob = await get(pathname, { access: 'private' })
      if (!blob || !blob.stream) return emptyState()
      const text = await new Response(blob.stream).text()
      cache = JSON.parse(text) as DbState
      return structuredClone(cache)
    },
    async write(next) {
      const { put } = await import('@vercel/blob')
      await put(pathname, JSON.stringify(next), {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
      })
      cache = structuredClone(next)
    },
  }
  return repoFrom(store, () => ensureSeed(store))
}
