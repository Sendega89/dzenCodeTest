import { sumByCurrency } from './money'
import type {
  DbState,
  GroupView,
  OrderView,
  ProductView,
  Snapshot,
  UserView,
} from './types'

const PRESENCE_TTL_MS = 6000

export function activePresence(state: DbState, now = Date.now()) {
  return state.presence.filter((item) => now - item.lastSeen < PRESENCE_TTL_MS)
}

export function project(state: DbState, now = Date.now()): Snapshot {
  const orders: OrderView[] = state.orders
    .map((order) => {
      const products = state.products.filter((product) => product.orderId === order.id)
      return {
        ...order,
        productCount: products.length,
        totalUsd: sumByCurrency(products, 'USD'),
        totalUah: sumByCurrency(products, 'UAH'),
      }
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id)

  const products: ProductView[] = state.products
    .map((product) => ({
      ...product,
      orderTitle: state.orders.find((order) => order.id === product.orderId)?.title ?? '—',
      groupName: state.groups.find((group) => group.id === product.groupId)?.name ?? null,
      userName: state.users.find((user) => user.id === product.userId)?.name ?? null,
    }))
    .sort((a, b) => b.id - a.id)

  const groups: GroupView[] = state.groups.map((group) => ({
    ...group,
    productCount: state.products.filter((product) => product.groupId === group.id).length,
  }))

  const users: UserView[] = state.users.map((user) => ({
    id: user.id,
    name: user.name,
    login: user.login,
    productCount: state.products.filter((product) => product.userId === user.id).length,
  }))

  return {
    revision: state.revision,
    orders,
    products,
    groups,
    users,
    presenceCount: activePresence(state, now).length,
  }
}

export function nextNumericId(ids: number[]): number {
  return ids.reduce((max, id) => Math.max(max, id), 0) + 1
}
