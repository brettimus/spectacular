# Drizzle SQLite Rules

## Deleting Records with Drizzle ORM

Safely delete records from SQLite databases using Drizzle ORM.

- Use `db.delete(table)` passing the table reference as parameter
- Always include a `where` clause unless you intend to delete all records
- Avoid the incorrect pattern of using `db.delete().from(table)`

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/delete)
- [Drizzle ORM SQLite Delete Documentation](https://orm.drizzle.team/docs/delete)

### Code Snippet

```typescript
import { eq, and } from "drizzle-orm";
import { schema } from "./db/schema";

// WRONG! This deletes all entries in the users table
// await db.delete().where(eq(schema.users.id, id)).from(schema.users);

// CORRECT! Specify the table as an argument to delete()
await db.delete(schema.users).where(eq(schema.users.id, id));

// Delete multiple records matching a condition
await db.delete(schema.tasks).where(eq(schema.tasks.completed, true));

// Delete with multiple conditions
await db.delete(schema.documents)
  .where(
    and(
      eq(schema.documents.status, "draft"),
      eq(schema.documents.ownerId, userId)
    )
  );
```

**Key Points:** Always specify the table as a parameter to the `delete()` method, not to `from()`. Including a `where` clause is critical to avoid accidentally deleting all records in a table. 