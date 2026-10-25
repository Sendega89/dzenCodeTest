import { cookies } from 'next/headers'
import { Source_Sans_3 } from 'next/font/google'
import { TOKEN_COOKIE, readToken } from '@inventory/auth'
import type { Locale } from '@inventory/domain'
import { AppProviders } from '@/providers'
import 'bootstrap/dist/css/bootstrap-grid.min.css'
import 'animate.css/animate.min.css'
import '@inventory/ui/styles.css'

const font = Source_Sans_3({ subsets: ['latin', 'cyrillic'], weight: ['400', '600', '700'] })

export const metadata = {
  title: 'Inventory',
  description: 'Orders and products',
  applicationName: 'Inventory',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon.svg' },
}

export const dynamic = 'force-dynamic'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies()
  const locale: Locale = jar.get('locale')?.value === 'en' ? 'en' : 'ru'
  const token = jar.get(TOKEN_COOKIE)?.value
  const session = token ? await readToken(token) : null
  return (
    <html lang={locale}>
      <body className={font.className}>
        <AppProviders locale={locale} user={session ? { id: session.id, name: session.login, login: session.login } : null}>
          {children}
        </AppProviders>
      </body>
    </html>
  )
}
