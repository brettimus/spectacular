## Using Middleware in Hono

Middleware in Hono allows you to execute code before and after route handlers:

- Middleware functions take context (`c`) and `next` parameters
- Call `await next()` to continue to the next middleware or route handler
- Use `c.set()` to add data to the context for later middleware or handlers
- Apply middleware globally with `app.use()` or to specific routes

```typescript
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'

const app = new Hono()

// Built-in middleware
app.use('*', logger())
app.use('/api/*', cors())

// Custom authentication middleware
const authMiddleware = async (c, next) => {
  const token = c.req.header('Authorization')
  
  if (!token || !token.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  // Add user data to context for route handlers
  c.set('user', { id: 123, role: 'admin' })
  
  // Continue to next middleware or route handler
  await next()
}

// Apply middleware to specific routes
app.use('/admin/*', authMiddleware)

// Access middleware data in route handler
app.get('/admin/dashboard', (c) => {
  const user = c.get('user')
  return c.json({ user, dashboard: 'data' })
})
``` 