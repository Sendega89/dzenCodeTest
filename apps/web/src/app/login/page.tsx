'use client'

import { useState } from 'react'
import { isAxiosError } from 'axios'
import { LoginCard } from '@inventory/ui'
import { api } from '@/api'
import { useI18n } from '@/providers'

export default function LoginPage() {
  const { messages } = useI18n()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <LoginCard
      messages={messages}
      pending={pending}
      error={error}
      onSubmit={(login, password) => {
        setPending(true)
        setError(null)
        void api
          .post('/api/auth/login', { login, password })
          .then(() => {
            window.location.href = '/orders'
          })
          .catch((cause: unknown) => {
            const status = isAxiosError(cause) ? cause.response?.status : undefined
            setError(status === 401 ? messages.login.error : messages.login.unavailable)
            setPending(false)
          })
      }}
    />
  )
}
