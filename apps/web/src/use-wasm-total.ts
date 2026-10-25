'use client'

import { useEffect, useState } from 'react'
import { toCents } from '@inventory/domain'

export function useWasmTotal(values: number[]): number | null {
  const [total, setTotal] = useState<number | null>(null)
  const key = values.join(',')

  useEffect(() => {
    const worker = new Worker('/totals.worker.js')
    const id = 1
    worker.onmessage = (event: MessageEvent<{ id: number; sum: number }>) => {
      if (event.data.id === id) setTotal(event.data.sum / 100)
    }
    worker.postMessage({ id, values: values.map((value) => toCents(value)) })
    return () => worker.terminate()
    // The joined key is the value identity for this small list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return total
}
