import { GraphQLError } from 'graphql'
import { createSchema, createYoga } from 'graphql-yoga'
import { readToken, tokenFromHeader, TOKEN_COOKIE } from '@inventory/auth'
import { FieldValidationError, NotFoundError } from './apply'
import type { Repo } from './json-repo'

function cookieValue(header: string | null, name: string): string | null {
  if (!header) return null
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return decodeURIComponent(rest.join('='))
  }
  return null
}

async function viewer(request: Request) {
  const token = tokenFromHeader(request.headers.get('authorization')) ?? cookieValue(request.headers.get('cookie'), TOKEN_COOKIE)
  if (!token) return null
  return readToken(token)
}

function fail(error: unknown): never {
  if (error instanceof FieldValidationError) {
    throw new GraphQLError('validation', { extensions: { code: 'VALIDATION', fields: error.fields } })
  }
  if (error instanceof NotFoundError) throw new GraphQLError('not_found', { extensions: { code: 'NOT_FOUND' } })
  throw error
}

const typeDefs = /* GraphQL */ `
  type SessionUser { id: Int! name: String! login: String! }
  type Price { value: Float! symbol: String! isDefault: Boolean! }
  type Order {
    id: Int!
    title: String!
    description: String!
    createdAt: String!
    productCount: Int!
    totalUsd: Float!
    totalUah: Float!
  }
  type Product {
    id: Int!
    title: String!
    type: String!
    specification: String!
    serialNumber: String!
    status: String!
    isNew: Boolean!
    photo: String!
    guaranteeStart: String!
    guaranteeEnd: String!
    orderId: Int!
    orderTitle: String!
    groupId: Int
    groupName: String
    userId: Int
    userName: String
    createdAt: String!
    price: [Price!]!
  }
  type Group { id: Int! name: String! productCount: Int! }
  type User { id: Int! name: String! login: String! productCount: Int! }
  type Snapshot {
    revision: Int!
    presenceCount: Int!
    orders: [Order!]!
    products: [Product!]!
    groups: [Group!]!
    users: [User!]!
  }
  type AuthPayload { token: String! user: SessionUser! snapshot: Snapshot! }
  type Query { snapshot: Snapshot! }
  type Mutation {
    login(login: String!, password: String!): AuthPayload!
    createOrder(title: String!, createdAt: String!, description: String): Snapshot!
    deleteOrder(id: Int!): Snapshot!
    deleteProduct(id: Int!): Snapshot!
  }
`

type Context = { user: { id: number; login: string } | null }

type Commands = {
  snapshot(): Promise<import('@inventory/domain').Snapshot>
  createOrder(input: unknown): Promise<import('@inventory/domain').Snapshot>
  deleteOrder(id: number): Promise<import('@inventory/domain').Snapshot>
  deleteProduct(id: number): Promise<import('@inventory/domain').Snapshot>
}

export function createInventoryYoga(repo: Repo, commands: Partial<Commands> = {}) {
  const run = {
    snapshot: () => commands.snapshot?.() ?? repo.snapshot(),
    createOrder: (input: unknown) => commands.createOrder?.(input) ?? repo.createOrder(input),
    deleteOrder: (id: number) => commands.deleteOrder?.(id) ?? repo.deleteOrder(id),
    deleteProduct: (id: number) => commands.deleteProduct?.(id) ?? repo.deleteProduct(id),
  }
  return createYoga<Context>({
    schema: createSchema({
      typeDefs,
      resolvers: {
        Query: {
          snapshot: async (_root, _args, ctx) => {
            if (!ctx.user) throw new GraphQLError('unauthorized', { extensions: { code: 'UNAUTHORIZED' } })
            return run.snapshot()
          },
        },
        Mutation: {
          login: async (_root, args) => {
            const user = await repo.authenticate(String(args.login), String(args.password))
            if (!user) throw new GraphQLError('unauthorized', { extensions: { code: 'UNAUTHORIZED' } })
            const { signToken } = await import('@inventory/auth')
            const token = await signToken(user)
            return { token, user, snapshot: await repo.snapshot() }
          },
          createOrder: async (_root, args, ctx) => {
            if (!ctx.user) throw new GraphQLError('unauthorized', { extensions: { code: 'UNAUTHORIZED' } })
            try {
              return await run.createOrder({
                title: args.title,
                createdAt: args.createdAt,
                description: args.description ?? '',
              })
            } catch (error) {
              fail(error)
            }
          },
          deleteOrder: async (_root, args, ctx) => {
            if (!ctx.user) throw new GraphQLError('unauthorized', { extensions: { code: 'UNAUTHORIZED' } })
            try {
              return await run.deleteOrder(Number(args.id))
            } catch (error) {
              fail(error)
            }
          },
          deleteProduct: async (_root, args, ctx) => {
            if (!ctx.user) throw new GraphQLError('unauthorized', { extensions: { code: 'UNAUTHORIZED' } })
            try {
              return await run.deleteProduct(Number(args.id))
            } catch (error) {
              fail(error)
            }
          },
        },
      },
    }),
    graphqlEndpoint: '/api/graphql',
    context: async ({ request }): Promise<Context> => ({ user: await viewer(request) }),
    maskedErrors: false,
  })
}
