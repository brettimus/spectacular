## Handling Requests and Responses in Hono

Hono provides methods for handling different types of request data and returning various response formats:

### Request Handling
- Get URL parameters: `c.req.param('id')`
- Get query parameters: `c.req.query('search')`
- Parse JSON body: `await c.req.json()`
- Get form data: `await c.req.formData()`
- Get multipart form data: `await c.req.parseBody()`
- Access headers: `c.req.header('content-type')`

### Response Helpers
- JSON responses: `c.json({ message: 'Success' })`
- Text responses: `c.text('Hello World')`
- HTML responses: `c.html('<h1>Hello</h1>')`
- Status codes: `c.status(201)`
- Custom headers: `c.header('X-Custom', 'value')`

```typescript
import { Hono } from 'hono'

const app = new Hono()

// Process different types of requests
app.post('/api/users', async (c) => {
  // Parse JSON body
  const data = await c.req.json()
  
  // 201 Created response with JSON
  return c.json({ id: 123, ...data }, 201)
})

// Query parameters and text response
app.get('/search', (c) => {
  const query = c.req.query('q')
  return c.text(`Search results for: ${query}`)
})

// Custom headers
app.get('/download', (c) => {
  return c.body('File content', 200, {
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': 'attachment; filename="file.txt"'
  })
})

// Multipart form data
app.post('/upload', async (c) => {
  const body = await c.req.parseBody()
  const file = body['file'] // File | string
  console.log(file) 
})
``` 