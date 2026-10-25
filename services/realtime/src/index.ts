import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { getRepo } from '@inventory/db'
import { presenceId } from '@inventory/domain'

const port = Number(process.env.PORT || 4001)
const server = createServer((_req, res) => {
  if (_req.url === '/health' || _req.url === '/') {
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ ok: true, service: 'realtime' }))
    return
  }
  res.writeHead(404)
  res.end()
})
const origins = (process.env.CORS_ORIGIN || 'http://localhost:8080').split(',').map((item) => item.trim())
const io = new Server(server, { cors: { origin: origins, credentials: true } })

async function broadcast() {
  const snapshot = await getRepo().snapshot()
  io.emit('presence', { count: snapshot.presenceCount })
}

io.on('connection', (socket) => {
  const clientId = presenceId(socket.handshake.auth?.clientId)
  if (!clientId) {
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
