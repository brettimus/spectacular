## Common Hono Mistakes to Avoid

Avoid these common mistakes when building Hono applications on Cloudflare Workers:

- ❌ Using `process.env` instead of context variables
- ❌ Creating Ruby on Rails-like controllers without proper type inference
- ❌ Looking for `.changed` property on Drizzle D1 query results
- ❌ Not handling errors properly in async route handlers
- ❌ Including large code examples in comments

### ✅ Correct Approaches

```typescript
// ❌ Wrong: Using process.env
app.get('/api/data', (c) => {
  const apiKey = process.env.API_KEY // WRONG!
  return c.text('Data')
})

// ✅ Correct: Access from context
app.get('/api/data', (c) => {
  const apiKey = c.env.API_KEY
  return c.text('Data')
})

// ❌ Wrong: Checking for .changed on Drizzle D1
app.post('/users', async (c) => {
  const db = drizzle(c.env.DB)
  const result = await db.insert(users).values(data)
  
  if (result.changed) { // WRONG! This property doesn't exist
    return c.json({ success: true })
  }
})

// ✅ Correct: Use .returning() to get results
app.post('/users', async (c) => {
  const db = drizzle(c.env.DB)
  const result = await db.insert(users)
    .values(data)
    .returning()
  
  return c.json(result[0], 201)
})

// ❌ Wrong: RoR-like controller without path parameter inference 
const getUser = (c: Context) => {
  const id = c.req.param('id') // Can't infer 'id' here
  return c.json(`User ${id}`)
}
app.get('/users/:id', getUser)

// ✅ Correct: Define handler inline for proper path parameter inference
app.get('/users/:id', (c) => {
  const id = c.req.param('id') // Properly inferred
  return c.json(`User ${id}`)
})
``` 