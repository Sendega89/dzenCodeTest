'use client'

import { useState } from 'react'
import {
  emptyOrderForm,
  emptyProductForm,
  loginSchema,
  orderSchema,
  productSchema,
  type GroupView,
  type OrderInput,
  type OrderView,
  type ProductInput,
  type UserView,
} from '@inventory/domain'
import { textOf, type Messages } from './i18n'
import { Modal } from './modal'
import { Banner, Button, Field, ModalActions } from './primitives'

function parseForm<T>(
  schema: { safeParse: (data: unknown) => { success: true; data: T } | { success: false; error: { issues: { path: PropertyKey[]; message: string }[] } } },
  data: unknown,
  setErrors: (errors: Record<string, string>) => void,
): T | null {
  const parsed = schema.safeParse(data)
  if (parsed.success) return parsed.data
  setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0] ?? 'form'), issue.message])))
  return null
}

export function OrderDialog({
  messages,
  pending,
  onClose,
  onSubmit,
}: {
  messages: Messages
  pending: boolean
  onClose: () => void
  onSubmit: (value: OrderInput) => void
}) {
  const [form, setForm] = useState(emptyOrderForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const set = (key: keyof OrderInput, value: string) => setForm((current) => ({ ...current, [key]: value }))
  return (
    <Modal
      title={messages.orders.add}
      closeLabel={messages.close}
      onClose={onClose}
      footer={
        <ModalActions
          form="order-form"
          cancelLabel={messages.cancel}
          confirmLabel={pending ? messages.loading : messages.save}
          pending={pending}
          onCancel={onClose}
        />
      }
    >
      <form
        id="order-form"
        className="stack"
        onSubmit={(event) => {
          event.preventDefault()
          const value = parseForm(orderSchema, form, setErrors)
          if (value) onSubmit(value)
        }}
      >
        <Field label={messages.forms.orderTitle} error={errors.title ? textOf(messages, errors.title) : undefined}>
          <input value={form.title} onChange={(event) => set('title', event.target.value)} />
        </Field>
        <Field label={messages.forms.date} error={errors.createdAt ? textOf(messages, errors.createdAt) : undefined}>
          <input type="date" value={form.createdAt} onChange={(event) => set('createdAt', event.target.value)} />
        </Field>
        <Field label={messages.forms.description}>
          <textarea value={form.description} onChange={(event) => set('description', event.target.value)} />
        </Field>
      </form>
    </Modal>
  )
}

export function ProductDialog({
  messages,
  pending,
  orders,
  groups,
  users,
  types,
  specifications,
  orderId,
  onClose,
  onSubmit,
}: {
  messages: Messages
  pending: boolean
  orders: OrderView[]
  groups: GroupView[]
  users: UserView[]
  types: string[]
  specifications: string[]
  orderId: number
  onClose: () => void
  onSubmit: (value: ProductInput) => void
}) {
  const [form, setForm] = useState(() => ({
    ...emptyProductForm(orderId),
    priceUsd: '' as unknown as number,
    priceUah: '' as unknown as number,
  }))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const set = (key: string, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }))
  return (
    <Modal
      title={messages.products.add}
      closeLabel={messages.close}
      onClose={onClose}
      footer={
        <ModalActions
          form="product-form"
          cancelLabel={messages.cancel}
          confirmLabel={pending ? messages.loading : messages.save}
          pending={pending}
          onCancel={onClose}
        />
      }
    >
      <form
        id="product-form"
        className="form-grid"
        onSubmit={(event) => {
          event.preventDefault()
          const value = parseForm(productSchema, form, setErrors)
          if (value) onSubmit(value)
        }}
      >
        <Field wide label={messages.forms.productTitle} error={errors.title ? textOf(messages, errors.title) : undefined}>
          <input value={form.title} onChange={(event) => set('title', event.target.value)} />
        </Field>
        <Field label={messages.forms.type} error={errors.type ? textOf(messages, errors.type) : undefined}>
          <input list="product-types" value={form.type} onChange={(event) => set('type', event.target.value)} />
          <datalist id="product-types">{types.map((type) => <option key={type} value={type} />)}</datalist>
        </Field>
        <Field label={messages.forms.specification} error={errors.specification ? textOf(messages, errors.specification) : undefined}>
          <input list="product-specs" value={form.specification} onChange={(event) => set('specification', event.target.value)} />
          <datalist id="product-specs">{specifications.map((specification) => <option key={specification} value={specification} />)}</datalist>
        </Field>
        <Field label={messages.forms.serial} error={errors.serialNumber ? textOf(messages, errors.serialNumber) : undefined}>
          <input value={form.serialNumber} onChange={(event) => set('serialNumber', event.target.value)} />
        </Field>
        <Field label={messages.forms.status}>
          <select value={form.status} onChange={(event) => set('status', event.target.value)}>
            <option value="free">{messages.products.free}</option>
            <option value="repair">{messages.products.repair}</option>
          </select>
        </Field>
        <Field label={messages.forms.guaranteeStart}>
          <input type="date" value={form.guaranteeStart} onChange={(event) => set('guaranteeStart', event.target.value)} />
        </Field>
        <Field label={messages.forms.guaranteeEnd} error={errors.guaranteeEnd ? textOf(messages, errors.guaranteeEnd) : undefined}>
          <input type="date" value={form.guaranteeEnd} onChange={(event) => set('guaranteeEnd', event.target.value)} />
        </Field>
        <Field label={messages.forms.priceUsd} error={errors.priceUsd ? textOf(messages, errors.priceUsd) : undefined}>
          <input inputMode="decimal" value={String(form.priceUsd)} onChange={(event) => set('priceUsd', event.target.value)} />
        </Field>
        <Field label={messages.forms.priceUah} error={errors.priceUah ? textOf(messages, errors.priceUah) : undefined}>
          <input inputMode="decimal" value={String(form.priceUah)} onChange={(event) => set('priceUah', event.target.value)} />
        </Field>
        <Field label={messages.forms.order}>
          <select value={form.orderId} onChange={(event) => set('orderId', event.target.value)}>
            {orders.map((order) => <option key={order.id} value={order.id}>{order.title}</option>)}
          </select>
        </Field>
        <Field label={messages.forms.group}>
          <select value={form.groupId ?? ''} onChange={(event) => set('groupId', event.target.value)}>
            <option value="">{messages.forms.none}</option>
            {groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
          </select>
        </Field>
        <Field label={messages.forms.user}>
          <select value={form.userId ?? ''} onChange={(event) => set('userId', event.target.value)}>
            <option value="">{messages.forms.none}</option>
            {users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
          </select>
        </Field>
        <label className="check">
          <input type="checkbox" checked={form.isNew} onChange={(event) => set('isNew', event.target.checked)} />
          {messages.forms.isNew}
        </label>
      </form>
    </Modal>
  )
}

export function LoginCard({
  messages,
  pending,
  error,
  onSubmit,
}: {
  messages: Messages
  pending: boolean
  error: string | null
  onSubmit: (login: string, password: string) => void
}) {
  const [login, setLogin] = useState('demo')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  return (
    <div className="login-page">
      <form
        className="login-card stack"
        onSubmit={(event) => {
          event.preventDefault()
          const value = parseForm(loginSchema, { login, password }, setErrors)
          if (value) onSubmit(value.login, value.password)
        }}
      >
        <h1>{messages.login.title}</h1>
        {error ? <Banner>{error}</Banner> : null}
        <Field label={messages.login.login} error={errors.login ? textOf(messages, errors.login) : undefined}>
          <input autoComplete="username" value={login} onChange={(event) => setLogin(event.target.value)} />
        </Field>
        <Field label={messages.login.password} error={errors.password ? textOf(messages, errors.password) : undefined}>
          <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </Field>
        <Button type="submit" disabled={pending}>{pending ? messages.login.pending : messages.login.submit}</Button>
        <p className="hint">{messages.login.hint}</p>
      </form>
    </div>
  )
}
