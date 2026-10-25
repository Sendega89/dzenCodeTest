import { z } from 'zod'
import { todayStamp } from './dates'

const moneyField = z.preprocess((value) => {
  if (typeof value === 'string') return value.replace(/\s/g, '').replace(',', '.')
  return value
}, z.coerce.number().finite().min(0, 'price.bad').max(1_000_000_000, 'price.bad'))

const dayField = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date.bad')

export const orderSchema = z.object({
  title: z.string().trim().min(3, 'title.min').max(200, 'title.min'),
  createdAt: dayField,
  description: z.string().trim().max(2000).optional().default(''),
})

export const productSchema = z
  .object({
    title: z.string().trim().min(3, 'title.min').max(200, 'title.min'),
    type: z.string().trim().min(2, 'type.min').max(64, 'type.min'),
    specification: z.string().trim().min(2, 'spec.min').max(120, 'spec.min'),
    serialNumber: z.string().trim().min(4, 'serial.min').max(64, 'serial.min'),
    status: z.enum(['free', 'repair']),
    isNew: z.boolean(),
    guaranteeStart: dayField,
    guaranteeEnd: dayField,
    priceUsd: moneyField,
    priceUah: moneyField,
    orderId: z.coerce.number().int().positive(),
    groupId: z.preprocess(
      (value) => (value === '' || value === null || value === undefined ? null : value),
      z.coerce.number().int().positive().nullable(),
    ),
    userId: z.preprocess(
      (value) => (value === '' || value === null || value === undefined ? null : value),
      z.coerce.number().int().positive().nullable(),
    ),
  })
  .refine((value) => value.guaranteeEnd >= value.guaranteeStart, {
    message: 'guarantee.order',
    path: ['guaranteeEnd'],
  })

export const loginSchema = z.object({
  login: z.string().trim().min(1, 'login.required').max(64),
  password: z.string().min(1, 'password.required').max(128),
})

export type OrderInput = z.infer<typeof orderSchema>
export type ProductInput = z.infer<typeof productSchema>
export type LoginInput = z.infer<typeof loginSchema>

export type FieldError = { field: string; message: string }

export function fieldErrors(error: z.ZodError): FieldError[] {
  return error.issues.map((issue) => ({
    field: String(issue.path[0] ?? 'form'),
    message: issue.message,
  }))
}

export function emptyOrderForm(): OrderInput {
  return { title: '', createdAt: todayStamp(), description: '' }
}

export function emptyProductForm(orderId: number): ProductInput {
  const start = todayStamp()
  return {
    title: '',
    type: '',
    specification: '',
    serialNumber: '',
    status: 'free',
    isNew: true,
    guaranteeStart: start,
    guaranteeEnd: start,
    priceUsd: 0,
    priceUah: 0,
    orderId,
    groupId: null,
    userId: null,
  }
}
