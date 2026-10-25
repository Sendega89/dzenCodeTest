import type { Repo } from '@inventory/db'
import type { DomainEvent } from '@inventory/domain'

export type EventHandler = (event: DomainEvent) => Promise<void> | void

export async function publishPending(repo: Repo, handlers: EventHandler[], limit = 50): Promise<number> {
  const events = await repo.pullEvents(limit)
  if (events.length === 0) return 0
  for (const event of events) {
    for (const handler of handlers) await handler(event)
  }
  await repo.markEvents(events.map((event) => event.id))
  return events.length
}

export function auditHandler(log: (line: string) => void = console.log): EventHandler {
  return (event) => {
    log(`[event] ${event.type} ${JSON.stringify(event.payload)}`)
  }
}
