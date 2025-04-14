# Drizzle SQLite Rules

## Defining Boolean Columns in SQLite with Drizzle ORM

This rule demonstrates how to define a boolean column in an SQLite table using Drizzle ORM. SQLite does not support a native boolean type, so this pattern shows how to use integers to represent boolean values.

- **sqliteTable**: This function is used to define a new table within the SQLite database.
- **integer({ mode: 'boolean' })**: This configuration sets up an integer column that is used to store boolean values (commonly 0 for false and 1 for true).

- SQLite does not have a dedicated boolean type; using integers is a common workaround.
- Ensure consistency in how boolean values are stored across your database schema.

- [Drizzle ORM SQLite Documentation](https://drizzle.zhcndoc.com/docs/column-types/sqlite)

- Storing boolean flags or status indicators in a SQLite database.
- Representing yes/no or true/false states when dealing with SQLite tables.

Instead of directly using integers, another approach can be mapping strings 'true' and 'false' to integers when reading and writing from the database, though this is less efficient.

### Code Snippet

```typescript
import { integer, sqliteTable } from "drizzle-orm/sqlite-core";

const table = sqliteTable('table', {
  id: integer({ mode: 'boolean' })
});
```

**Reasoning:** This rule demonstrates how to define a boolean column in an SQLite table using Drizzle ORM by specifying the integer type with a mode of 'boolean'. It showcases a method to handle boolean data types in SQLite, which natively does not have a dedicated boolean type.