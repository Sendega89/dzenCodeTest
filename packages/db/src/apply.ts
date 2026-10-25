import {
  buildSeed,
  fieldErrors,
  nextNumericId,
  orderSchema,
  productSchema,
  type DbState,
  type OrderInput,
  type Product,
  type ProductInput,
} from '@inventory/domain'
import { hashPassword } from './password'

export class FieldValidationError extends Error {
  fields: { field: string; message: string }[]
  constructor(fields: { field: string; message: string }[]) {
    super('validation')
    this.fields = fields
  }
}

export class NotFoundError extends Error {
  constructor(message = 'not_found') {
    super(message)
  }
}

export function emptyState(): DbState {
  return { revision: 0, users: [], groups: [], orders: [], products: [], presence: [], outbox: [] }
}

export async function seededState(): Promise<DbState> {
  const draft = buildSeed()
  const users = await Promise.all(
    draft.users.map(async ({ password, ...user }) => ({
      ...user,
      passwordHash: await hashPassword(password),
    })),
  )
  return {
    revision: 1,
    users,
    groups: draft.groups,
    orders: draft.orders,
    products: draft.products,
    presence: [],
    outbox: [
      {
        id: 1,
        type: 'inventory.seeded',
        payload: { orders: draft.orders.length, products: draft.products.length },
        createdAt: new Date().toISOString(),
        processedAt: null,
      },
    ],
  }
}

function bump(state: DbState, type: string, payload: Record<string, unknown>): DbState {
  const id = nextNumericId(state.outbox.map((event) => event.id))
  return {
    ...state,
    revision: state.revision + 1,
    outbox: [
      ...state.outbox,
      { id, type, payload, createdAt: new Date().toISOString(), processedAt: null },
    ],
  }
}

function parseOrder(input: unknown): OrderInput {
  const parsed = orderSchema.safeParse(input)
  if (!parsed.success) throw new FieldValidationError(fieldErrors(parsed.error))
  return parsed.data
}

function parseProduct(input: unknown): ProductInput {
  const parsed = productSchema.safeParse(input)
  if (!parsed.success) throw new FieldValidationError(fieldErrors(parsed.error))
  return parsed.data
}

export function createOrder(state: DbState, input: unknown): DbState {
  const data = parseOrder(input)
  const id = nextNumericId(state.orders.map((order) => order.id))
  return bump(
    { ...state, orders: [...state.orders, { id, ...data }] },
    'order.created',
    { id, title: data.title },
  )
}

export function deleteOrder(state: DbState, id: number): DbState {
  if (!state.orders.some((order) => order.id === id)) throw new NotFoundError()
  const removed = state.products.filter((product) => product.orderId === id).map((product) => product.id)
  return bump(
    {
      ...state,
      orders: state.orders.filter((order) => order.id !== id),
      products: state.products.filter((product) => product.orderId !== id),
    },
    'order.deleted',
    { id, productIds: removed },
  )
}

export function createProduct(state: DbState, input: unknown): DbState {
  const data = parseProduct(input)
  if (!state.orders.some((order) => order.id === data.orderId)) throw new NotFoundError('order')
  if (data.groupId && !state.groups.some((group) => group.id === data.groupId)) {
    throw new FieldValidationError([{ field: 'groupId', message: 'relation.missing' }])
  }
  if (data.userId && !state.users.some((user) => user.id === data.userId)) {
    throw new FieldValidationError([{ field: 'userId', message: 'relation.missing' }])
  }
  const id = nextNumericId(state.products.map((product) => product.id))
  const product: Product = {
    id,
    title: data.title,
    type: data.type,
    specification: data.specification,
    serialNumber: data.serialNumber,
    status: data.status,
    isNew: data.isNew,
    photo: '/monitor.svg',
    guaranteeStart: data.guaranteeStart,
    guaranteeEnd: data.guaranteeEnd,
    orderId: data.orderId,
    groupId: data.groupId,
    userId: data.userId,
    createdAt: data.guaranteeStart,
    price: [
      { value: data.priceUsd, symbol: 'USD', isDefault: false },
      { value: data.priceUah, symbol: 'UAH', isDefault: true },
    ],
  }
  return bump({ ...state, products: [...state.products, product] }, 'product.created', {
    id,
    orderId: product.orderId,
  })
}

export function deleteProduct(state: DbState, id: number): DbState {
  const current = state.products.find((product) => product.id === id)
  if (!current) throw new NotFoundError()
  return bump(
    { ...state, products: state.products.filter((product) => product.id !== id) },
    'product.deleted',
    { id, orderId: current.orderId },
  )
}

export function touchPresence(state: DbState, clientId: string, now = Date.now()): DbState {
  const rest = state.presence.filter((item) => item.clientId !== clientId && now - item.lastSeen < 6000)
  return { ...state, presence: [...rest, { clientId, lastSeen: now }] }
}

export function leavePresence(state: DbState, clientId: string): DbState {
  return { ...state, presence: state.presence.filter((item) => item.clientId !== clientId) }
}

export function markEventsProcessed(state: DbState, ids: number[], at = new Date().toISOString()): DbState {
  const set = new Set(ids)
  return {
    ...state,
    outbox: state.outbox.map((event) => (set.has(event.id) ? { ...event, processedAt: at } : event)),
  }
}
