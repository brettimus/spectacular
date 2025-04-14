## Path Parameters in Hono

Define dynamic routes with path parameters to create flexible endpoints:

- Use colon prefix (`:name`) to define a path parameter
- Access path parameters with `c.req.param('name')` 
- Extract multiple parameters with destructuring: `const { id, comment_id } = c.req.param()`
- Optional parameters use a question mark: `:type?`

```typescript
import { Hono } from 'hono'
const app = new Hono()

// Single parameter
app.get('/user/:name', async (c) => {
  const name = c.req.param('name')
  return c.text(`Hello, ${name}!`)
})

// Multiple parameters
app.get('/posts/:id/comment/:comment_id', async (c) => {
  const { id, comment_id } = c.req.param()
  return c.text(`Post ${id}, Comment ${comment_id}`)
})

// Optional parameter
app.get('/api/animal/:type?', (c) => {
  const type = c.req.param('type')
  return c.text(type ? `Animal: ${type}` : 'All Animals')
})
``` 