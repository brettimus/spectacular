## Auto-incrementing Integer Primary Key in SQLite

How to create an auto-incrementing integer primary key in SQLite with Drizzle.

- `integer({ mode: 'number' })`: Initializes an integer column with number mode
- `.primaryKey({ autoIncrement: true })`: Sets the column as a primary key with auto-increment enabled


```typescript
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

const someTable = sqliteTable('some_table', {
    id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
    name: text(),
});
```