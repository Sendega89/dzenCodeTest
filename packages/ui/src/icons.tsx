import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

export function Logo(props: IconProps) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" {...props}>
      <path fill="#8bc346" d="M16 2 6 6.2v8.4c0 6.4 4.2 11.6 10 13.4 5.8-1.8 10-7 10-13.4V6.2L16 2Z" />
      <path fill="#fff" d="M11 15.2h10v6.2H11z" />
      <path fill="#fff" d="M13.2 13.2h5.6V15H13.2z" />
    </svg>
  )
}

export function Avatar(props: IconProps) {
  return (
    <svg viewBox="0 0 74 74" className="avatar" aria-hidden="true" {...props}>
      <circle cx="37" cy="37" r="37" fill="#d5e3ea" />
      <circle cx="37" cy="30" r="12" fill="#f2d3bf" />
      <path d="M16 64c4-12 12-18 21-18s17 6 21 18" fill="#8bc346" />
      <path d="M22 28c2-8 8-12 15-12 6 0 12 3 14 11-4 2-8 1-14 1s-11 1-15 0Z" fill="#3d342f" />
    </svg>
  )
}

export function Gear(props: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="#8aa0aa" d="M19.4 13a7.7 7.7 0 0 0 .1-1 7.7 7.7 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-1.7-1L15 3h-4l-.3 2.9a7.6 7.6 0 0 0-1.7 1l-2.4-1-2 3.4L6.6 11a7.7 7.7 0 0 0-.1 1 7.7 7.7 0 0 0 .1 1l-2 1.6 2 3.4 2.4-1a7.6 7.6 0 0 0 1.7 1L11 22h4l.3-2.9a7.6 7.6 0 0 0 1.7-1l2.4 1 2-3.4-2-1.7ZM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5Z" />
    </svg>
  )
}

export function ClockIcon(props: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="8" fill="none" stroke="#8bc346" strokeWidth="2" />
      <path d="M12 8v5l3 2" fill="none" stroke="#8bc346" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function ListIcon(props: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="#b7c3cb" d="M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4z" />
    </svg>
  )
}

export function Trash(props: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 6h2v9h-2V9Zm4 0h2v9h-2V9ZM7 9h2v9H7V9Z" />
    </svg>
  )
}

export function Plus(props: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M11 4h2v16h-2z" />
      <path fill="currentColor" d="M4 11h16v2H4z" />
    </svg>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

export function MenuIcon(props: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
    </svg>
  )
}
