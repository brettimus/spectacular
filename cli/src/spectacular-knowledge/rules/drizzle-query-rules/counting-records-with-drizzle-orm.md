# Drizzle SQLite Rules

## Counting Records with Drizzle ORM

Get the total count of records in a table using the `count()` function.

- Use `count()` in a select statement to count rows
- Rename destructured property to avoid naming conflicts
- Can be combined with filters for targeted counting

```typescript
import { count } from "drizzle-orm";
import { schema } from "./db/schema";

// Count all users
const [ { count: usersCount } ] = await db.select({ 
  count: count() 
}).from(schema.users);

// Count with a filter
import { eq } from "drizzle-orm";
const [ { count: activeUsersCount } ] = await db.select({
  count: count()
}).from(schema.users).where(eq(schema.users.status, "active"));

// Count specific column (counts non-null values)
const [ { count: emailCount } ] = await db.select({
  count: count(schema.users.email)
}).from(schema.users);
```

**Key Points:** Property renaming through destructuring is needed to avoid naming conflicts. The count function returns an array with a single object containing the count property.

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/select)
- [Drizzle ORM SQLite Count Documentation](https://orm.drizzle.team/docs/select#count-sum-avg-min-max)

- **Record Counting**: Useful for pagination, data analytics, and determining the size of datasets.
- **Performance Optimization**: Count operations can be combined with filtering to get specific counts without loading all records. 