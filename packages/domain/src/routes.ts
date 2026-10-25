const CYRILLIC: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'i',
  к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
  х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

export function slugify(value: string): string {
  const transliterated = value
    .trim()
    .toLowerCase()
    .split('')
    .map((char) => CYRILLIC[char] ?? char)
    .join('')
  return transliterated
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function resolveSlug(slug: string, values: string[]): string | null {
  const normalized = slugify(slug)
  return values.find((value) => slugify(value) === normalized) ?? null
}

export function parseId(value: string): number | null {
  if (!/^\d+$/.test(value)) return null
  const id = Number(value)
  return id > 0 ? id : null
}

export function presenceId(value: unknown): string | null {
  return typeof value === 'string' && /^[\w-]{8,64}$/.test(value) ? value : null
}

export function catalogType(slug: string, products: { type: string }[]): string | null {
  return resolveSlug(slug, [...new Set(products.map((product) => product.type))])
}

export function resolveUser<T extends { id: number; login: string; name: string }>(slug: string, users: T[]): T | null {
  const decoded = decodeURIComponent(slug)
  const id = parseId(decoded)
  if (id) return users.find((user) => user.id === id) ?? null
  const key = slugify(decoded)
  return users.find((user) => slugify(user.login) === key || slugify(user.name) === key) ?? null
}

export type ProductQuery = { type?: string; spec?: string; q?: string }

function join(base: string, segment?: string): string {
  const root = base.replace(/\/$/, '') || ''
  if (!segment) return root || '/'
  return `${root}/${segment}`
}

function search(path: string, query?: { q?: string; spec?: string }): string {
  const params = new URLSearchParams()
  if (query?.q) params.set('q', query.q)
  if (query?.spec) params.set('spec', query.spec)
  const suffix = params.toString()
  return suffix ? `${path}?${suffix}` : path
}

export class AppRoutes {
  constructor(private readonly roots: { orders: string; products: string } = { orders: '/orders', products: '/products' }) {}

  login(): string {
    return '/login'
  }

  orders(query?: string): string {
    return search(this.roots.orders || '/', { q: query })
  }

  order(id: number, query?: string): string {
    return search(join(this.roots.orders, String(id)), { q: query })
  }

  products(input: ProductQuery = {}): string {
    const path = input.type ? join(this.roots.products, slugify(input.type)) : this.roots.products || '/'
    return search(path, { q: input.q, spec: input.spec })
  }

  product(id: number): string {
    return `/products/${id}`
  }

  user(user: { id: number; login: string }): string {
    const handle = slugify(user.login)
    return handle ? `/users/${handle}` : `/users/${user.id}`
  }

  productNav(state: ProductQuery) {
    const current: ProductQuery = {
      type: state.type || undefined,
      spec: state.spec || undefined,
      q: state.q || undefined,
    }
    return {
      type: (value: string) => this.products({ ...current, type: value || undefined }),
      spec: (value: string) => this.products({ ...current, spec: value || undefined }),
      reset: () => this.products({ q: current.q }),
      search: (query: string) => this.products({ ...current, q: query || undefined }),
    }
  }

  groups(): string {
    return '/groups'
  }

  users(): string {
    return '/users'
  }

  settings(): string {
    return '/settings'
  }

  isOrders(pathname: string): boolean {
    return pathname === this.roots.orders || pathname.startsWith(`${this.roots.orders}/`)
  }

  isProducts(pathname: string): boolean {
    const root = this.roots.products || '/'
    if (root === '/') return true
    return pathname === root || pathname.startsWith(`${root}/`)
  }

  isProductCatalog(pathname: string): boolean {
    if (!this.isProducts(pathname)) return false
    const rest = pathname.replace(/^\/products\/?/, '')
    return !rest || parseId(rest) == null
  }

  isUsers(pathname: string): boolean {
    return pathname === '/users' || pathname.startsWith('/users/')
  }
}

export const routes = new AppRoutes()

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message = 'request failed',
  ) {
    super(message)
    this.name = 'HttpError'
  }
}
