## Error Handling in Hono

Implement robust error handling in Hono with error middleware and try-catch blocks:

- Use middleware to catch errors thrown by route handlers
- Create custom error classes for different error types
- Implement consistent error response formats
- Use try-catch blocks within complex route handlers

```typescript
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

// Custom application error class
class AppError extends Error {
  status: number
  
  constructor(message: string, status = 500) {
    super(message)
    this.status = status
  }
}

const app = new Hono()

// Global error handling middleware
app.onError((err, c) => {
  console.error('Error:', err)
  
  // Handle HTTPException (built into Hono)
  if (err instanceof HTTPException) {
    return err.getResponse()
  }
  
  // Handle custom AppError
  if (err instanceof AppError) {
    return c.json({
      error: {
        message: err.message,
        code: err.status
      }
    }, err.status)
  }
  
  // Handle unknown errors
  return c.json({
    error: {
      message: 'Internal Server Error',
      code: 500
    }
  }, 500)
})

// Route using HTTPException
app.get('/not-found', (c) => {
  throw new HTTPException(404, { message: 'Resource not found' })
})

// Route using custom error
app.get('/error', (c) => {
  throw new AppError('Something went wrong', 400)
})

// Route with try-catch
app.get('/users/:id', async (c) => {
  const id = c.req.param('id')
  
  try {
    // Example database operation that might fail
    const user = await findUser(id)
    
    if (!user) {
      throw new AppError('User not found', 404)
    }
    
    return c.json(user)
  } catch (error) {
    // Specific error handling for this route
    if (error.code === 'CONN_ERROR') {
      throw new AppError('Database connection failed', 503)
    }
    
    // Re-throw for global handler
    throw error
  }
})

function findUser(id: string) {
  // Simulation of database call
  return Promise.resolve(id === '1' ? { id, name: 'User 1' } : null)
}
``` 