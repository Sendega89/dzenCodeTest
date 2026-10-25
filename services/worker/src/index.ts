import { getRepo } from '@inventory/db'
import { auditHandler, publishPending } from '@inventory/events'

const handler = auditHandler()

async function tick() {
  const count = await publishPending(getRepo(), [handler])
  if (count > 0) console.log(`processed ${count} event(s)`)
}

void tick()
setInterval(() => {
  void tick().catch((error) => console.error(error))
}, 2000)
