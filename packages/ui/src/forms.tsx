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

function errorsOf(issues: { field: string; message: string }[]) {
  return Object.fromEntries(issues.map((issue) => [issue.field, issue.message]))
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
        <>
          <button type="button" className="linkish" onClick={onClose}>{messages.cancel}</button>
          <button type="submit" form="order-form" className="btn" disabled={pending}>{pending ? messages.loading : messages.save}</button>
        </>
      }
    >
      <form
        id="order-form"
        className="stack"
        onSubmit={(event) => {
          event.preventDefault()
          const parsed = orderSchema.safeParse(form)
          if (!parsed.success) {
            setErrors(errorsOf(parsed.error.issues.map((issue) => ({ field: String(issue.path[0] ?? 'form'), message: issue.message }))))
            return
          }
          onSubmit(parsed.data)
        }}
      >
        <label className="field">
          <span>{messages.forms.orderTitle}</span>
          <input value={form.title} onChange={(event) => set('title', event.target.value)} />
          {errors.title ? <span className="field__error">{textOf(messages, errors.title)}</span> : null}
        </label>
        <label className="field">
          <span>{messages.forms.date}</span>
          <input type="date" value={form.createdAt} onChange={(event) => set('createdAt', event.target.value)} />
          {errors.createdAt ? <span className="field__error">{textOf(messages, errors.createdAt)}</span> : null}
        </label>
        <label className="field">
          <span>{messages.forms.description}</span>
          <textarea value={form.description} onChange={(event) => set('description', event.target.value)} />
        </label>
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
        <>
          <button type="button" className="linkish" onClick={onClose}>{messages.cancel}</button>
          <button type="submit" form="product-form" className="btn" disabled={pending}>{pending ? messages.loading : messages.save}</button>
        </>
      }
    >
      <form
        id="product-form"
        className="form-grid"
        onSubmit={(event) => {
          event.preventDefault()
          const parsed = productSchema.safeParse(form)
          if (!parsed.success) {
            setErrors(errorsOf(parsed.error.issues.map((issue) => ({ field: String(issue.path[0] ?? 'form'), message: issue.message }))))
            return
          }
          onSubmit(parsed.data)
        }}
      >
        <label className="field field--wide">
          <span>{messages.forms.productTitle}</span>
          <input value={form.title} onChange={(event) => set('title', event.target.value)} />
          {errors.title ? <span className="field__error">{textOf(messages, errors.title)}</span> : null}
        </label>
        <label className="field">
          <span>{messages.forms.type}</span>
          <input list="product-types" value={form.type} onChange={(event) => set('type', event.target.value)} />
          <datalist id="product-types">{types.map((type) => <option key={type} value={type} />)}</datalist>
          {errors.type ? <span className="field__error">{textOf(messages, errors.type)}</span> : null}
        </label>
        <label className="field">
          <span>{messages.forms.specification}</span>
          <input list="product-specs" value={form.specification} onChange={(event) => set('specification', event.target.value)} />
          <datalist id="product-specs">{specifications.map((specification) => <option key={specification} value={specification} />)}</datalist>
          {errors.specification ? <span className="field__error">{textOf(messages, errors.specification)}</span> : null}
        </label>
        <label className="field">
          <span>{messages.forms.serial}</span>
          <input value={form.serialNumber} onChange={(event) => set('serialNumber', event.target.value)} />
          {errors.serialNumber ? <span className="field__error">{textOf(messages, errors.serialNumber)}</span> : null}
        </label>
        <label className="field">
          <span>{messages.forms.status}</span>
          <select value={form.status} onChange={(event) => set('status', event.target.value)}>
            <option value="free">{messages.products.free}</option>
            <option value="repair">{messages.products.repair}</option>
          </select>
        </label>
        <label className="field">
          <span>{messages.forms.guaranteeStart}</span>
          <input type="date" value={form.guaranteeStart} onChange={(event) => set('guaranteeStart', event.target.value)} />
        </label>
        <label className="field">
          <span>{messages.forms.guaranteeEnd}</span>
          <input type="date" value={form.guaranteeEnd} onChange={(event) => set('guaranteeEnd', event.target.value)} />
          {errors.guaranteeEnd ? <span className="field__error">{textOf(messages, errors.guaranteeEnd)}</span> : null}
        </label>
        <label className="field">
          <span>{messages.forms.priceUsd}</span>
          <input inputMode="decimal" value={String(form.priceUsd)} onChange={(event) => set('priceUsd', event.target.value)} />
          {errors.priceUsd ? <span className="field__error">{textOf(messages, errors.priceUsd)}</span> : null}
        </label>
        <label className="field">
          <span>{messages.forms.priceUah}</span>
          <input inputMode="decimal" value={String(form.priceUah)} onChange={(event) => set('priceUah', event.target.value)} />
          {errors.priceUah ? <span className="field__error">{textOf(messages, errors.priceUah)}</span> : null}
        </label>
        <label className="field">
          <span>{messages.forms.order}</span>
          <select value={form.orderId} onChange={(event) => set('orderId', event.target.value)}>
            {orders.map((order) => <option key={order.id} value={order.id}>{order.title}</option>)}
          </select>
        </label>
        <label className="field">
          <span>{messages.forms.group}</span>
          <select value={form.groupId ?? ''} onChange={(event) => set('groupId', event.target.value)}>
            <option value="">{messages.forms.none}</option>
            {groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
          </select>
        </label>
        <label className="field">
          <span>{messages.forms.user}</span>
          <select value={form.userId ?? ''} onChange={(event) => set('userId', event.target.value)}>
            <option value="">{messages.forms.none}</option>
            {users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
          </select>
        </label>
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
  error: boolean
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
          const parsed = loginSchema.safeParse({ login, password })
          if (!parsed.success) {
            setErrors(errorsOf(parsed.error.issues.map((issue) => ({ field: String(issue.path[0] ?? 'form'), message: issue.message }))))
            return
          }
          onSubmit(parsed.data.login, parsed.data.password)
        }}
      >
        <h1>{messages.login.title}</h1>
        {error ? <div className="banner" role="alert">{messages.login.error}</div> : null}
        <label className="field">
          <span>{messages.login.login}</span>
          <input autoComplete="username" value={login} onChange={(event) => setLogin(event.target.value)} />
          {errors.login ? <span className="field__error">{textOf(messages, errors.login)}</span> : null}
        </label>
        <label className="field">
          <span>{messages.login.password}</span>
          <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
          {errors.password ? <span className="field__error">{textOf(messages, errors.password)}</span> : null}
        </label>
        <button className="btn" type="submit" disabled={pending}>{pending ? messages.login.pending : messages.login.submit}</button>
        <p className="hint">{messages.login.hint}</p>
      </form>
    </div>
  )
}
