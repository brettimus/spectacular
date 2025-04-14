## Defining Boolean Columns in SQLite with Drizzle ORM

How to define a boolean column in an SQLite table using Drizzle ORM.

- **integer({ mode: 'boolean' })**: This configuration sets up an integer column that is used to store boolean values (commonly 0 for false and 1 for true).

- SQLite does not have a dedicated boolean type; using integers is a common workaround.

```typescript
import { integer, sqliteTable } from "drizzle-orm/sqlite-core";

const table = sqliteTable('table', {
  id: integer({ mode: 'boolean' })
});
```
