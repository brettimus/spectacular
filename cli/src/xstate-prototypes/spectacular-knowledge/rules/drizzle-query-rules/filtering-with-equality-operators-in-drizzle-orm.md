# Drizzle SQLite Rules

## Filtering with Equality Operators in Drizzle ORM

Filter records using the `eq()` function for exact matches.

- `eq(column, value)` creates an equality condition (SQL `=`)
- Use with `where()` to filter query results
- Array destructuring helps extract single results

- Always use the appropriate filter function from Drizzle ORM rather than writing raw SQL conditions.
- When expecting a single result, use array destructuring with the first element to handle the common case where you only need one record.
- Ensure that the column you're filtering on is properly indexed for performance, especially for frequent queries.

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/select)
- [Drizzle ORM SQLite Filtering Documentation](https://orm.drizzle.team/docs/select#where)

- **Record Retrieval**: Perfect for finding specific records by unique identifiers or exact match criteria.
- **Validation**: Useful for validating the existence of records with specific attributes.
- **Resource Lookup**: Common in API endpoints that need to fetch resources by ID or other unique properties.

### Code Snippet

```typescript
import { eq } from "drizzle-orm";
import { schema } from "./db/schema";

// Get a user by ID
const [user] = await db.select()
  .from(schema.users)
  .where(eq(schema.users.id, "user-123"));

// Check if record exists
if (!user) {
  return null; // Handle not found case
}

// Multiple records with same value
const activeUsers = await db.select()
  .from(schema.users)
  .where(eq(schema.users.status, "active"));

// Combined with other query methods
const recentPosts = await db.select()
  .from(schema.posts)
  .where(eq(schema.posts.authorId, userId))
  .orderBy(desc(schema.posts.createdAt))
  .limit(10);
```

**Key Points:** For finding a single record, use array destructuring with the first element to easily handle the common use case. Ensure columns used with `eq()` are indexed for better performance. 