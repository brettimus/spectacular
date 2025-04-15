## Accessing Environment Variables in Cloudflare Workers

In Cloudflare Workers with Hono, environment variables must be accessed from the context parameter:

- Define environment variable types with the `Bindings` interface
- Pass the Bindings type to Hono's generic parameter
- Access environment variables using `c.env.VARIABLE_NAME` inside route handlers
- Never use `process.env` in Cloudflare Workers

```typescript
import { Hono } from 'hono'

// Define your environment variable types
type Bindings = {
  API_KEY: string;
  DATABASE_URL: string;
};

// Create app with Bindings type
const app = new Hono<{ Bindings: Bindings }>();

app.get('/api/data', async (c) => {
  // Access env variables from context
  const apiKey = c.env.API_KEY;
  const dbUrl = c.env.DATABASE_URL;
  
  // Use them in your API logic
  const response = await fetch('https://api.example.com/data', {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  
  return c.json(await response.json());
});
``` 