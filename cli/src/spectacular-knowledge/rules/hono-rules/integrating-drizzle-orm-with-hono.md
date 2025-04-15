## Integrating Drizzle ORM with Hono on Cloudflare Workers

Connect to Cloudflare D1 (SQLite) using Drizzle ORM in your Hono application:

- Access the D1 database from the Cloudflare Worker context
- Set up the Drizzle client with the D1 driver
- Use Drizzle query builder to interact with your database
- Structure routes for clean CRUD operations

```typescript
import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import { users, posts } from './db/schema'

// Define Bindings for environment variables
type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// Create users CRUD endpoints
app.get('/users', async (c) => {
  // Initialize Drizzle with D1 database from context
  const db = drizzle(c.env.DB)
  
  // Query all users
  const usersList = await db.select().from(users)
  return c.json(usersList)
})

app.get('/users/:id', async (c) => {
  const db = drizzle(c.env.DB)
  const id = Number.parseInt(c.req.param('id'))
  
  // Query single user by ID
  const user = await db.select()
    .from(users)
    .where(eq(users.id, id))
    .get()
  
  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }
  
  return c.json(user)
})

app.post('/users', async (c) => {
  const db = drizzle(c.env.DB)
  const data = await c.req.json()
  
  // Insert new user
  const result = await db.insert(users)
    .values(data)
    .returning()
  
  return c.json(result[0], 201)
})

app.put('/users/:id', async (c) => {
  const db = drizzle(c.env.DB)
  const id = Number.parseInt(c.req.param('id'))
  const data = await c.req.json()
  
  // Update user
  const result = await db.update(users)
    .set(data)
    .where(eq(users.id, id))
    .returning()
  
  if (result.length === 0) {
    return c.json({ error: 'User not found' }, 404)
  }
  
  return c.json(result[0])
})

app.delete('/users/:id', async (c) => {
  const db = drizzle(c.env.DB)
  const id = Number.parseInt(c.req.param('id'))
  
  // Delete user
  await db.delete(users)
    .where(eq(users.id, id))
  
  return c.json({ success: true })
})

export default app
``` 