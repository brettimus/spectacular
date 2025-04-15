## Basic CRUD Operations with Drizzle ORM and SQLite

Perform Create, Read, Update, and Delete operations with Drizzle ORM.

- `db.insert(table).values(data)` to create records
- `db.select().from(table)` to read records
- `db.update(table).set(data).where(condition)` to update records
- `db.delete(table).where(condition)` to delete records

```typescript
import { drizzle } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import { schema } from './db/schema';

const db = drizzle(process.env.DB_FILE_NAME);

// CREATE: Insert a new user
const newUser = {
  name: 'John',
  email: 'john@example.com',
  age: 30
};
await db.insert(schema.users).values(newUser);

// READ: Select all users
const allUsers = await db.select().from(schema.users);

// READ: Select a specific user
const [user] = await db.select()
  .from(schema.users)
  .where(eq(schema.users.email, 'john@example.com'));

// UPDATE: Modify user data
await db.update(schema.users)
  .set({ age: 31 })
  .where(eq(schema.users.email, 'john@example.com'));

// DELETE: Remove a user
await db.delete(schema.users)
  .where(eq(schema.users.email, 'john@example.com'));
```

**Key Points:** Drizzle provides a type-safe API for all basic database operations. Use table schemas to get TypeScript inference for data structures. Always use the `where` clause with update and delete operations to target specific records.