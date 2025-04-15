## Accessing JSON Columns in Drizzle ORM

Store and retrieve JSON data in SQLite text columns with type safety.

- `mode: 'json'` option for text columns automatically handles serialization/deserialization
- Type definitions with `$type<T>()` provide TypeScript type checking for JSON properties
- JSON data is automatically parsed when retrieved - direct property access without `JSON.parse()`

```typescript
import { text, sqliteTable } from "drizzle-orm/sqlite-core";
import { eq, sql } from "drizzle-orm";

// Define table with JSON column
const usersTable = sqliteTable('users', {
  id: text('id').primaryKey(),
  preferences: text('preferences', { mode: 'json' }).$type<{
    theme: 'light' | 'dark';
    notifications: boolean;
  }>()
});

// Insert with JSON data
await db.insert(usersTable).values({
  id: 'user1',
  preferences: { theme: 'dark', notifications: true }
});

// Query and access JSON directly
const [user] = await db.select().from(usersTable).where(eq(usersTable.id, 'user1'));
console.log(user.preferences.theme); // 'dark'

// Update JSON data
await db.update(usersTable)
  .set({ preferences: { ...user.preferences, theme: 'light' } })
  .where(eq(usersTable.id, 'user1'));

// Filter using JSON property (requires SQLite JSON extension)
const darkThemeUsers = await db.select()
  .from(usersTable)
  .where(sql`json_extract(${usersTable.preferences}, '$.theme') = 'dark'`);
```

**Key Points:** JSON columns simplify complex data storage without separate tables. SQLite stores JSON as text, while Drizzle handles parsing. Type definitions provide IDE autocompletion and prevent errors when accessing properties.

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/column-types/sqlite)
- [Drizzle ORM JSON Column Documentation](https://orm.drizzle.team/docs/column-types/sqlite#text)

- **Configuration Storage**: Storing application or user configuration settings.
- **Flexible Data Models**: Storing semi-structured data that doesn't fit well into a relational model.
- **Document Storage**: Using SQLite for document-like data when a full document database is unnecessary.

### Code Snippet

```typescript
import { text, sqliteTable } from "drizzle-orm/sqlite-core";
import { eq } from "drizzle-orm";
import { schema } from "./db/schema";

// Schema definition with JSON column
const usersTable = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  preferences: text('preferences', { mode: 'json' }).$type<{
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  }>()
});

// Inserting data with JSON column
await db.insert(schema.users).values({
  id: 'user1',
  name: 'Alice',
  preferences: {
    theme: 'dark',
    notifications: true,
    language: 'en'
  }
});

// Querying and accessing JSON data
const user = await db.select().from(schema.users).where(eq(schema.users.id, 'user1'));
const userPreferences = user[0]?.preferences;

// JSON is already parsed - access properties directly
if (userPreferences) {
  console.log(`User theme: ${userPreferences.theme}`);
  console.log(`Notifications enabled: ${userPreferences.notifications}`);
  console.log(`Language: ${userPreferences.language}`);
}

// Updating JSON data
await db.update(schema.users)
  .set({
    preferences: {
      ...userPreferences,
      theme: 'light'
    }
  })
  .where(eq(schema.users.id, 'user1'));

// Filtering based on JSON properties (requires SQLite version with JSON support)
// This approach relies on SQLite JSON extensions like json_extract
import { sql } from "drizzle-orm";
const darkThemeUsers = await db.select()
  .from(schema.users)
  .where(
    sql`json_extract(${schema.users.preferences}, '$.theme') = 'dark'`
  );
```

**Reasoning:** Working with JSON data in relational databases is increasingly common for applications that need flexible data models. This rule demonstrates how to leverage Drizzle ORM's JSON column support in SQLite to store, retrieve, and manipulate structured data in a type-safe way. It also shows how to use SQLite's JSON functions for more advanced filtering operations. 