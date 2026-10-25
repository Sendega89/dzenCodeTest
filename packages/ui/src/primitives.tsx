'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { Messages } from './i18n'

type ButtonVariant = 'primary' | 'ghost' | 'white' | 'link' | 'icon' | 'trash' | 'plus'

const BUTTON_CLASS: Record<ButtonVariant, string> = {
  primary: 'btn',
  ghost: 'btn btn--ghost',
  white: 'btn btn--white',
  link: 'linkish',
  icon: 'icon-button',
  trash: 'trash',
  plus: 'plus',
}

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button type="button" className={[BUTTON_CLASS[variant], className].filter(Boolean).join(' ')} {...props} />
}

export function Banner({ children }: { children: ReactNode }) {
  return <div className="banner" role="alert">{children}</div>
}

export function Field({
  label,
  error,
  children,
  wide,
}: {
  label: string
  error?: string
  children: ReactNode
  wide?: boolean
}) {
  return (
    <label className={wide ? 'field field--wide' : 'field'}>
      <span>{label}</span>
      {children}
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  )
}

export function PageHead({
  title,
  total,
  shown,
  messages,
  lead,
  trail,
}: {
  title: string
  total?: number
  shown?: number
  messages: Messages
  lead?: ReactNode
  trail?: ReactNode
}) {
  return (
    <div className="page-head">
      {lead}
      <h1>{total == null ? title : `${title} / ${total}`}</h1>
      {shown != null ? <span className="muted">{messages.shown} {shown}</span> : null}
      {trail}
    </div>
  )
}

export function EmptyHint({ children }: { children: ReactNode }) {
  return <p className="muted">{children}</p>
}

export function ModalActions({
  cancelLabel,
  confirmLabel,
  pending,
  danger,
  form,
  onCancel,
}: {
  cancelLabel: string
  confirmLabel: string
  pending?: boolean
  danger?: boolean
  form?: string
  onCancel: () => void
}) {
  return (
    <>
      <Button variant={danger ? 'ghost' : 'link'} onClick={onCancel}>{cancelLabel}</Button>
      {form ? (
        <button type="submit" form={form} className={danger ? 'btn btn--white' : 'btn'} disabled={pending}>
          {confirmLabel}
        </button>
      ) : (
        <Button variant={danger ? 'white' : 'primary'} disabled={pending}>{confirmLabel}</Button>
      )}
    </>
  )
}
