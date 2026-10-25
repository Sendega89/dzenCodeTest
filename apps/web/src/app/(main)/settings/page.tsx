'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import type { Locale } from '@inventory/domain'
import { SettingsBoard } from '@inventory/ui'
import { api } from '@/api'
import { useAppSelector, useI18n } from '@/providers'

const WarehouseMap = dynamic(() => import('@/map').then((mod) => mod.WarehouseMap), { ssr: false })

export default function SettingsPage() {
  const { messages, locale } = useI18n()
  const user = useAppSelector((state) => state.session.user)
  const router = useRouter()

  async function onLocale(next: Locale) {
    window.localStorage.setItem('inventory.locale', next)
    await api.post('/api/locale', { locale: next })
    router.refresh()
  }

  async function onLogout() {
    await api.post('/api/auth/logout')
    window.location.href = '/login'
  }

  return (
    <SettingsBoard
      messages={messages}
      user={user}
      locale={locale}
      onLocale={(next) => void onLocale(next)}
      onLogout={() => void onLogout()}
      map={<WarehouseMap label={messages.settings.map} />}
    />
  )
}
