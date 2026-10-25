'use client'

import type { ReactNode } from 'react'
import { Modal } from './modal'
import { Button } from './primitives'
import type { Messages } from './i18n'

export function ConfirmDialog({
  messages,
  title,
  pending,
  onClose,
  onConfirm,
  children,
}: {
  messages: Messages
  title: string
  pending?: boolean
  onClose: () => void
  onConfirm: () => void
  children: ReactNode
}) {
  return (
    <Modal
      danger
      title={title}
      closeLabel={messages.close}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>{messages.cancel}</Button>
          <Button variant="white" disabled={pending} onClick={onConfirm}>{messages.delete}</Button>
        </>
      }
    >
      {children}
    </Modal>
  )
}
