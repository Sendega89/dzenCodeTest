'use client'

import { useState } from 'react'
import { LoginCard } from '@inventory/ui'
import { api, rememberToken } from '@/api'
import { useI18n } from '@/providers'

export default function LoginPage() {
  const { messages } = useI18n()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(false)

  return (
    <LoginCard
      messages={messages}
      pending={pending}
      error={error}
      onSubmit={(login, password) => {
        setPending(true)
        setError(false)
        void api
          .post<{ token: string }>('/api/auth/login', { login, password })
          .then((response) => {
            rememberToken(response.data.token)
            window.localStorage.setItem('inventory.locale', window.localStorage.getItem('inventory.locale') || 'ru')
            window.location.href = '/orders'
          })
          .catch(() => {
            setError(true)
            setPending(false)
          })
      }}
    />
  )
}
