import { cookies } from 'next/headers'
import { Suspense } from 'react'
import { TOKEN_COOKIE, readSession } from '@inventory/auth'
import { loadSnapshot } from '@inventory/db'
import { localeOf } from '@inventory/domain'
import { AppProviders } from '@/providers'
import { Frame } from '@/frame'

export const dynamic = 'force-dynamic'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies()
  const locale = localeOf(jar.get('locale')?.value)
  const session = await readSession(jar.get(TOKEN_COOKIE)?.value)
  const snapshot = await loadSnapshot()
  const user = snapshot.users.find((item) => item.id === session?.id) ?? null
  return (
    <AppProviders snapshot={snapshot} user={user} locale={locale}>
      <Suspense fallback={null}>
        <Frame>{children}</Frame>
      </Suspense>
    </AppProviders>
  )
}
