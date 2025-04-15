## Validating Request Data in Hono

Use Hono's built-in validator middleware or zod integration to validate request data:

- Validate URL parameters, query strings, headers, cookies, and request bodies
- Built-in validator provides schema validation
- Zod integration offers more powerful type-safe validation
- Return consistent error responses for invalid requests

```typescript
import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

const app = new Hono()

// Built-in validator for simple validation
app.post(
  '/users',
  validator('json', (value, c) => {
    const body = value as any
    if (!body.name || typeof body.name !== 'string') {
      return c.json({ error: 'name is required and must be a string' }, 400)
    }
    if (!body.email || typeof body.email !== 'string') {
      return c.json({ error: 'email is required and must be a string' }, 400)
    }
    return value
  }),
  async (c) => {
    const data = await c.req.valid('json')
    return c.json({ id: 123, ...data }, 201)
  }
)

// Zod validator for type-safe validation
const UserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(18).optional()
})

app.post(
  '/users/zod',
  zValidator('json', UserSchema),
  async (c) => {
    // Data is fully typed according to schema
    const data = await c.req.valid('json')
    return c.json({ id: 123, ...data }, 201)
  }
)
``` 