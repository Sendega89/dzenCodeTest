export type Locale = 'ru' | 'en'

export function localeOf(value: string | undefined | null): Locale {
  return value === 'en' ? 'en' : 'ru'
}
export type ProductStatus = 'free' | 'repair'
export type Currency = 'USD' | 'UAH'

export type Price = {
  value: number
  symbol: Currency
  isDefault: boolean
}

export type Product = {
  id: number
  serialNumber: string
  isNew: boolean
  photo: string
  title: string
  type: string
  specification: string
  status: ProductStatus
  guaranteeStart: string
  guaranteeEnd: string
  price: Price[]
  orderId: number
  groupId: number | null
  userId: number | null
  createdAt: string
}

export type Order = {
  id: number
  title: string
  description: string
  createdAt: string
}

export type Group = { id: number; name: string }

export type User = {
  id: number
  name: string
  login: string
  passwordHash: string
}

export type OrderView = Order & {
  productCount: number
  totalUsd: number
  totalUah: number
  products: ProductView[]
}

export type ProductView = Product & {
  orderTitle: string
  groupName: string | null
  userName: string | null
  userLogin: string | null
}

export type GroupView = Group & { productCount: number }

export type UserView = {
  id: number
  name: string
  login: string
  productCount: number
}

export type SessionUser = { id: number; name: string; login: string }

export type Snapshot = {
  revision: number
  orders: OrderView[]
  products: ProductView[]
  groups: GroupView[]
  users: UserView[]
  presenceCount: number
}

export type DomainEvent = {
  id: number
  type: string
  payload: Record<string, unknown>
  createdAt: string
  processedAt: string | null
}

export type DbState = {
  revision: number
  users: User[]
  groups: Group[]
  orders: Order[]
  products: Product[]
  presence: { clientId: string; lastSeen: number }[]
  outbox: DomainEvent[]
}
