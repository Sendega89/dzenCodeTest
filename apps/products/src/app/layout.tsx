import type { Metadata } from 'next'
import '@inventory/ui/styles.css'

export const metadata: Metadata = { title: 'Inventory products' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
