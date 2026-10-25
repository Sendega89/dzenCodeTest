import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { getRepo } from '@inventory/db'

const port = Number(process.env.PORT || 4001)
const server = createServer((_req, res) => {
  res.writeHead(200, { 'content-type': 'application/json' })
  res.end(JSON.stringify({ ok: true, service: 'realtime' }))
})
const io = new Server(server, { cors: { origin: '*' }, transports: ['websocket'] })

async function broadcast() {
  const snapshot = await getRepo().snapshot()
  io.emit('presence', { count: snapshot.presenceCount })
}

io.on('connection', (socket) => {
  const clientId = String(socket.handshake.auth?.clientId || '')
  if (!/^[\w-]{8,64}$/.test(clientId)) {
    socket.disconnect()
    return
  }
  void getRepo().touchPresence(clientId).then(() => broadcast())
  const timer = setInterval(() => void getRepo().touchPresence(clientId).then(() => broadcast()), 4000)
  socket.on('disconnect', () => {
    clearInterval(timer)
    void getRepo().leavePresence(clientId).then(() => broadcast())
  })
})

server.listen(port, () => console.log(`realtime on ${port}`))
