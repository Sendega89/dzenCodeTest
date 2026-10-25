'use client'

import { useCallback, useState } from 'react'
import { HttpError } from '@inventory/domain'

export async function requestJson<T>(path: string, method: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!response.ok) throw new HttpError(response.status)
  return response.json() as Promise<T>
}

export function useMutation(fallback: string) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  const run = useCallback(async <T,>(action: () => Promise<T>): Promise<T | null> => {
    setPending(true)
    setError('')
    try {
      return await action()
    } catch {
      setError(fallback)
      return null
    } finally {
      setPending(false)
    }
  }, [fallback])

  return { pending, error, run }
}

export function useSnapshotMutation<T>(fallback: string, apply: (value: T) => void) {
  const { pending, error, run } = useMutation(fallback)
  const commit = useCallback(async (action: () => Promise<T>) => {
    const next = await run(action)
    if (next == null) return false
    apply(next)
    return true
  }, [apply, run])
  return { pending, error, commit }
}
