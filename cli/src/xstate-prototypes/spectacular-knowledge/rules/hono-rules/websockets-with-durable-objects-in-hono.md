## WebSockets with Durable Objects in Hono

Implement WebSocket connections in Hono using Cloudflare Durable Objects for state management:

- Durable Objects provide persistent connections and state
- Create a Durable Object class to manage WebSocket sessions
- Use Hono to upgrade HTTP connections to WebSocket
- Enable real-time communication between clients

```typescript
// durable-object.ts
export class ChatRoom implements DurableObject {
  private sessions: WebSocket[] = []
  private state: DurableObjectState

  constructor(state: DurableObjectState) {
    this.state = state
  }

  async fetch(request: Request) {
    // Create a new Hono app for the Durable Object
    const app = new Hono()

    // Handle WebSocket upgrades
    app.get('/websocket', async (c) => {
      // Upgrade the request to a WebSocket
      const upgradeHeader = request.headers.get('Upgrade')
      if (!upgradeHeader || upgradeHeader !== 'websocket') {
        return new Response('Expected Upgrade: websocket', { status: 426 })
      }

      // Create the WebSocket pair
      const { 0: client, 1: server } = new WebSocketPair()

      // Accept the WebSocket connection
      server.accept()

      // Add to sessions and set up event handlers
      this.sessions.push(server)

      // Handle messages
      server.addEventListener('message', async (event) => {
        const message = event.data
        
        // Broadcast message to all connected clients
        this.broadcast(message, server)
      })

      // Handle close
      server.addEventListener('close', () => {
        this.sessions = this.sessions.filter(session => session !== server)
      })

      // Return the client end of the WebSocket
      return new Response(null, {
        status: 101,
        webSocket: client
      })
    })

    return app.fetch(request)
  }

  // Broadcast message to all sessions except the sender
  broadcast(message: string, sender: WebSocket) {
    for (const session of this.sessions) {
      if (session !== sender && session.readyState === WebSocket.READY_STATE_OPEN) {
        session.send(message)
      }
    }
  }
}

// worker.ts (main worker)
import { Hono } from 'hono'

// Define bindings for Durable Object namespace
interface Env {
  CHAT_ROOM: DurableObjectNamespace
}

const app = new Hono<{ Bindings: Env }>()

// Create a route to connect to the WebSocket
app.get('/chat/:roomId', async (c) => {
  const roomId = c.req.param('roomId')
  
  // Get a stub for the Durable Object with this room ID
  const id = c.env.CHAT_ROOM.idFromName(roomId)
  const stub = c.env.CHAT_ROOM.get(id)
  
  // Forward the request to the Durable Object
  return stub.fetch(c.req.raw)
})

export default app

// Required exports for Durable Objects
export { ChatRoom }
```

For more details, see:
- https://developers.cloudflare.com/durable-objects/
- https://fiberplane.com/blog/creating-websocket-server-hono-durable-objects/ 