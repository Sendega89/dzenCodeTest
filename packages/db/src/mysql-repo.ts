import { createPool, type Pool, type PoolConnection, type RowDataPacket } from 'mysql2/promise'
import { project, type DbState, type DomainEvent, type Price, type Product, type Snapshot } from '@inventory/domain'
import {
  createOrder,
  createProduct,
  deleteOrder,
  deleteProduct,
  markEventsProcessed,
  seededState,
} from './apply'
import { verifyPassword } from './password'
import type { Repo } from './json-repo'
import { SCHEMA_SQL } from './schema'

type Sql = Pool | PoolConnection

function day(value: unknown): string {
  if (value instanceof Date) {
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
  }
  return String(value).slice(0, 10)
}

function num(value: unknown): number {
  return typeof value === 'number' ? value : Number(value)
}

async function readState(sql: Sql): Promise<DbState> {
  const [users] = await sql.query<RowDataPacket[]>('SELECT id, name, login, password_hash FROM users')
  const [groups] = await sql.query<RowDataPacket[]>('SELECT id, name FROM product_groups')
  const [orders] = await sql.query<RowDataPacket[]>('SELECT id, title, description, created_at FROM orders')
  const [products] = await sql.query<RowDataPacket[]>(
    'SELECT id, serial_number, is_new, photo, title, type, specification, status, guarantee_start, guarantee_end, order_id, group_id, user_id, created_at FROM products',
  )
  const [prices] = await sql.query<RowDataPacket[]>('SELECT product_id, value, symbol, is_default FROM product_prices')
  const [presence] = await sql.query<RowDataPacket[]>('SELECT client_id, last_seen FROM presence')
  const [outbox] = await sql.query<RowDataPacket[]>('SELECT id, type, payload, created_at, processed_at FROM outbox')
  const [meta] = await sql.query<RowDataPacket[]>("SELECT v FROM meta WHERE k = 'revision'")

  const priceByProduct = new Map<number, Price[]>()
  for (const row of prices) {
    const list = priceByProduct.get(Number(row.product_id)) ?? []
    list.push({
      value: num(row.value),
      symbol: row.symbol === 'USD' ? 'USD' : 'UAH',
      isDefault: Boolean(row.is_default),
    })
    priceByProduct.set(Number(row.product_id), list)
  }

  return {
    revision: meta[0] ? Number(meta[0].v) : 0,
    users: users.map((row) => ({
      id: Number(row.id),
      name: String(row.name),
      login: String(row.login),
      passwordHash: String(row.password_hash),
    })),
    groups: groups.map((row) => ({ id: Number(row.id), name: String(row.name) })),
    orders: orders.map((row) => ({
      id: Number(row.id),
      title: String(row.title),
      description: row.description ? String(row.description) : '',
      createdAt: day(row.created_at),
    })),
    products: products.map((row) => {
      const product: Product = {
        id: Number(row.id),
        serialNumber: String(row.serial_number),
        isNew: Boolean(row.is_new),
        photo: row.photo ? String(row.photo) : '/monitor.svg',
        title: String(row.title),
        type: String(row.type),
        specification: String(row.specification),
        status: row.status === 'repair' ? 'repair' : 'free',
        guaranteeStart: day(row.guarantee_start),
        guaranteeEnd: day(row.guarantee_end),
        price: priceByProduct.get(Number(row.id)) ?? [],
        orderId: Number(row.order_id),
        groupId: row.group_id == null ? null : Number(row.group_id),
        userId: row.user_id == null ? null : Number(row.user_id),
        createdAt: day(row.created_at),
      }
      return product
    }),
    presence: presence.map((row) => ({ clientId: String(row.client_id), lastSeen: Number(row.last_seen) })),
    outbox: outbox.map((row) => {
      const payload = typeof row.payload === 'string' ? JSON.parse(row.payload) : (row.payload ?? {})
      const event: DomainEvent = {
        id: Number(row.id),
        type: String(row.type),
        payload,
        createdAt: String(row.created_at),
        processedAt: row.processed_at ? String(row.processed_at) : null,
      }
      return event
    }),
  }
}

async function replaceInventory(sql: Sql, state: DbState): Promise<void> {
  await sql.query('DELETE FROM product_prices')
  await sql.query('DELETE FROM products')
  await sql.query('DELETE FROM orders')
  await sql.query('DELETE FROM outbox')
  await sql.query('DELETE FROM product_groups')
  await sql.query('DELETE FROM users')
  await sql.query('DELETE FROM meta')

  for (const user of state.users) {
    await sql.query('INSERT INTO users (id, name, login, password_hash) VALUES (?, ?, ?, ?)', [
      user.id,
      user.name,
      user.login,
      user.passwordHash,
    ])
  }
  for (const group of state.groups) {
    await sql.query('INSERT INTO product_groups (id, name) VALUES (?, ?)', [group.id, group.name])
  }
  for (const order of state.orders) {
    await sql.query('INSERT INTO orders (id, title, description, created_at) VALUES (?, ?, ?, ?)', [
      order.id,
      order.title,
      order.description,
      order.createdAt,
    ])
  }
  for (const product of state.products) {
    await sql.query(
      `INSERT INTO products
        (id, serial_number, is_new, photo, title, type, specification, status, guarantee_start, guarantee_end, order_id, group_id, user_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product.id,
        product.serialNumber,
        product.isNew ? 1 : 0,
        product.photo,
        product.title,
        product.type,
        product.specification,
        product.status,
        product.guaranteeStart,
        product.guaranteeEnd,
        product.orderId,
        product.groupId,
        product.userId,
        product.createdAt,
      ],
    )
    for (const price of product.price) {
      await sql.query('INSERT INTO product_prices (product_id, value, symbol, is_default) VALUES (?, ?, ?, ?)', [
        product.id,
        price.value,
        price.symbol,
        price.isDefault ? 1 : 0,
      ])
    }
  }
  for (const event of state.outbox) {
    await sql.query('INSERT INTO outbox (id, type, payload, created_at, processed_at) VALUES (?, ?, ?, ?, ?)', [
      event.id,
      event.type,
      JSON.stringify(event.payload),
      event.createdAt.slice(0, 19).replace('T', ' '),
      event.processedAt ? event.processedAt.slice(0, 19).replace('T', ' ') : null,
    ])
  }
  await sql.query("INSERT INTO meta (k, v) VALUES ('revision', ?)", [String(state.revision)])
}

export function createMysqlRepo(databaseUrl: string): Repo {
  const pool = createPool({
    uri: databaseUrl,
    connectionLimit: 32,
    multipleStatements: true,
    charset: 'utf8mb4',
    dateStrings: true,
  })

  let ready: Promise<void> | null = null

  async function init() {
    if (!ready) {
      ready = (async () => {
        await pool.query(SCHEMA_SQL)
        const state = await readState(pool)
        if (state.users.length === 0) {
          const conn = await pool.getConnection()
          try {
            await conn.beginTransaction()
            await conn.query("SELECT GET_LOCK('inventory', 10)")
            await replaceInventory(conn, await seededState())
            await conn.query("SELECT RELEASE_LOCK('inventory')")
            await conn.commit()
          } catch (error) {
            await conn.rollback()
            throw error
          } finally {
            conn.release()
          }
        }
      })()
    }
    await ready
  }

  async function mutate(mutator: (state: DbState) => DbState): Promise<Snapshot> {
    await init()
    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()
      await conn.query("SELECT GET_LOCK('inventory', 10)")
      const current = await readState(conn)
      const next = mutator(current)
      await replaceInventory(conn, next)
      await conn.query("SELECT RELEASE_LOCK('inventory')")
      await conn.commit()
      const presence = await readState(pool)
      return project({ ...next, presence: presence.presence })
    } catch (error) {
      await conn.rollback()
      throw error
    } finally {
      conn.release()
    }
  }

  return {
    init,
    async snapshot(now) {
      await init()
      return project(await readState(pool), now)
    },
    async authenticate(login, password) {
      await init()
      const state = await readState(pool)
      const user = state.users.find((item) => item.login === login)
      if (!user) return null
      const ok = await verifyPassword(password, user.passwordHash)
      if (!ok) return null
      return { id: user.id, name: user.name, login: user.login }
    },
    createOrder: (input) => mutate((state) => createOrder(state, input)),
    deleteOrder: (id) => mutate((state) => deleteOrder(state, id)),
    createProduct: (input) => mutate((state) => createProduct(state, input)),
    deleteProduct: (id) => mutate((state) => deleteProduct(state, id)),
    async touchPresence(clientId, now = Date.now()) {
      await init()
      await pool.query(
        'INSERT INTO presence (client_id, last_seen) VALUES (?, ?) ON DUPLICATE KEY UPDATE last_seen = VALUES(last_seen)',
        [clientId, now],
      )
      await pool.query('DELETE FROM presence WHERE last_seen < ?', [now - 6000])
      return project(await readState(pool), now)
    },
    async leavePresence(clientId) {
      await init()
      await pool.query('DELETE FROM presence WHERE client_id = ?', [clientId])
      return project(await readState(pool))
    },
    async pullEvents(limit = 50) {
      await init()
      return (await readState(pool)).outbox.filter((event) => !event.processedAt).slice(0, limit)
    },
    async markEvents(ids) {
      await mutate((state) => markEventsProcessed(state, ids))
    },
  }
}
