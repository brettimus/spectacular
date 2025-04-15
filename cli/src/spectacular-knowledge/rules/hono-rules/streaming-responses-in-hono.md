## Streaming Responses in Hono

Hono supports streaming responses using the streaming helper for real-time data:

- Use the `streamText()` or `streamSSE()` helpers for text streams
- Use `streamingResponse()` for more control over streaming
- Stream JSON chunks with proper formatting
- Set appropriate headers for streaming responses

```typescript
import { Hono } from 'hono'
import { streamText, streamSSE } from 'hono/streaming'

const app = new Hono()

// Simple text streaming
app.get('/stream', (c) => {
  return streamText(c, async (stream) => {
    for (let i = 0; i < 10; i++) {
      await stream.write(`Data chunk ${i}\n`)
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    await stream.write('Stream complete')
  })
})

// Server-Sent Events (SSE) streaming
app.get('/sse', (c) => {
  return streamSSE(c, async (stream) => {
    for (let i = 0; i < 10; i++) {
      await stream.writeSSE({
        data: JSON.stringify({ count: i }),
        event: 'update',
        id: String(i)
      })
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  })
})

// Custom streaming with more control
app.get('/custom-stream', (c) => {
  return new Response(
    new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        
        for (let i = 0; i < 5; i++) {
          const chunk = encoder.encode(`Chunk ${i}\n`)
          controller.enqueue(chunk)
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        
        controller.close()
      }
    }),
    {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    }
  )
})

// For AI-related streaming from Cloudflare AI
app.get('/ai-stream', async (c) => {
  const ai = c.env.AI

  return streamText(c, async (stream) => {
    // Example of streaming from AI
    const response = await ai.run('@cf/meta/llama-2-7b-chat-int8', {
      messages: [{ role: 'user', content: 'Write a short poem about clouds' }],
      stream: true
    })
    
    for await (const chunk of response) {
      await stream.write(chunk.response)
    }
  })
})
```

For more details, see: https://hono.dev/docs/helpers/streaming 