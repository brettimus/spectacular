## Handling Errors in Drizzle ORM with Hono

Handle database errors in Hono API routes with proper TypeScript type narrowing.

- Avoid using `any` type for errors - it bypasses TypeScript's type checking
- Use type narrowing with `instanceof Error` to safely access error properties
- Map database errors to appropriate HTTP status codes

```typescript
import { Hono } from "hono";
import { eq } from "drizzle-orm";

const app = new Hono();

// BAD: Using 'any' type for errors
app.get("/users/:id/bad", async (c) => {
  try {
    const id = c.req.param("id");
    const [user] = await c.env.DB.select()
      .from(schema.users)
      .where(eq(schema.users.id, id));
    
    if (!user) return c.json({ error: "User not found" }, 404);
    return c.json(user);
  } catch (error: any) { // TypeScript error
    return c.json({ error: "Database error", details: error.message }, 500);
  }
});

// GOOD: Using proper type narrowing
app.get("/users/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const [user] = await c.env.DB.select()
      .from(schema.users)
      .where(eq(schema.users.id, id));
    
    if (!user) return c.json({ error: "User not found" }, 404);
    return c.json(user);
  } catch (error) {
    return c.json({
      error: "Database error",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Handle specific database error types
app.post("/users", async (c) => {
  try {
    const data = await c.req.json();
    const [user] = await c.env.DB.insert(schema.users)
      .values(data)
      .returning();
    
    return c.json(user, 201);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("UNIQUE constraint failed")) {
        return c.json({ error: "User already exists" }, 409);
      } else if (error.message.includes("NOT NULL constraint failed")) {
        return c.json({ error: "Missing required fields" }, 400);
      }
      return c.json({ error: "Database error", details: error.message }, 500);
    }
    return c.json({ error: "Unknown error", details: String(error) }, 500);
  }
});
```

**Key Points:** Always narrow error types for type safety. Pattern match on error messages to provide meaningful responses. Create consistent error response structures across your API. 