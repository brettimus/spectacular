# Drizzle SQLite Rules

## Basic CRUD Operations with Drizzle ORM and SQLite

This guide demonstrates how to integrate Drizzle ORM with SQLite, showing key database operations such as creating, reading, updating, and deleting records.

1. **Setup**: Import the necessary modules, including dotenv for environment variables, and initialize the Drizzle ORM with your SQLite database file specified in `.env`.

2. **Create**: Insert a new record into the `usersTable` and confirm creation.

3. **Read**: Select and log all users from the `usersTable`.

4. **Update**: Update specific user details using a WHERE clause for precision.

5. **Delete**: Remove records by criteria, demonstrating a full CRUD cycle.

- Ensure all environment variables, such as `DB_FILE_NAME`, are correctly configured.
- Handle exceptions or errors that may occur during operations to maintain data integrity and stability.

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/get-started/sqlite-existing)
- SQLite and Drizzle ORM integration guide

- Rapid prototyping with SQLite.
- CRUD operations in lightweight applications.
- Applications or scripts where portability of the database is beneficial.

### Code Snippet

```typescript
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import { usersTable } from './db/schema';

const db = drizzle(process.env.DB_FILE_NAME!);

async function main() {
  const user: typeof usersTable.$inferInsert = {
    name: 'John',
    age: 30,
    email: '[email protected]',
  };

  await db.insert(usersTable).values(user);
  console.log('New user created!')

  const users = await db.select().from(usersTable);
  console.log('Getting all users from the database: ', users)
  /*
  const users: {
    id: number;
    name: string;
    age: number;
    email: string;
  }[]
  */

  await db
    .update(usersTable)
    .set({
      age: 31,
    })
    .where(eq(usersTable.email, user.email));
  console.log('User info updated!')

  await db.delete(usersTable).where(eq(usersTable.email, user.email));
  console.log('User deleted!')
}

main();
```

**Reasoning:** This rule is important because it provides a practical guide to using Drizzle ORM with SQLite in an existing project. It demonstrates basic database operations such as inserting, updating, selecting, and deleting data. Understanding these operations is crucial for anyone looking to manage SQLite databases effectively with Drizzle ORM.