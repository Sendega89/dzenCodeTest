import { cookies } from 'next/headers'
import { Suspense } from 'react'
import { readToken, TOKEN_COOKIE } from '@inventory/auth'
import { getRepo } from '@inventory/db'
import type { Locale } from '@inventory/domain'
import { AppProviders } from '@/providers'
import { Frame } from '@/frame'

export const dynamic = 'force-dynamic'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies()
  const locale: Locale = jar.get('locale')?.value === 'en' ? 'en' : 'ru'
  const token = jar.get(TOKEN_COOKIE)?.value
  const session = token ? await readToken(token) : null
  const snapshot = await getRepo().snapshot()
  const user = snapshot.users.find((item) => item.id === session?.id) ?? null
  return (
    <AppProviders snapshot={snapshot} user={user} locale={locale}>
      <Suspense fallback={null}>
        <Frame>{children}</Frame>
      </Suspense>
    </AppProviders>
  )
}
