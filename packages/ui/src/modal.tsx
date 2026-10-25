'use client'

import { useEffect, useId, useRef, type ReactNode } from 'react'
import { CloseIcon } from './icons'

type ModalProps = {
  title: string
  closeLabel: string
  onClose: () => void
  children: ReactNode
  footer: ReactNode
  danger?: boolean
}

export function Modal({ title, closeLabel, onClose, children, footer, danger }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null)
  const titleId = useId()

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const node = ref.current
    node?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab' || !node) return
      const items = node.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href]')
      const first = items[0]
      const last = items[items.length - 1]
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [onClose])

  return (
    <div className="modal-root animate__animated animate__fadeIn" onMouseDown={onClose}>
      <div
        className={(danger ? 'modal modal--danger' : 'modal') + ' animate__animated animate__zoomIn'}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        ref={ref}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button type="button" className="icon-button icon-button--ghost modal__close" aria-label={closeLabel} onClick={onClose}>
          <CloseIcon />
        </button>
        <h2 id={titleId} className="modal__title">{title}</h2>
        <div className="modal__body">{children}</div>
        <div className="modal__footer">{footer}</div>
      </div>
    </div>
  )
}
