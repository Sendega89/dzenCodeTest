import { Source_Sans_3 } from 'next/font/google'
import 'bootstrap/dist/css/bootstrap-grid.min.css'
import 'animate.css/animate.min.css'
import '@inventory/ui/styles.css'

const font = Source_Sans_3({ subsets: ['latin', 'cyrillic'], weight: ['400', '600', '700'] })

export const metadata = { title: 'Inventory products' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={font.className}>{children}</body>
    </html>
  )
}
