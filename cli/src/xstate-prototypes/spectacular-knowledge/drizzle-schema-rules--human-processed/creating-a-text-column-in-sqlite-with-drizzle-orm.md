## Creating a Text Column in SQLite

How to create a text column in SQLite with Drizzle.

- `text()`: Creates a column for storing string data
- Can be used with modifiers like `notNull()`, `default()`, etc.

```typescript
import { text, sqliteTable } from "drizzle-orm/sqlite-core";

const someTable = sqliteTable('some_table', {
  content: text(),
  description: text().notNull(),
  category: text().default('general')
});
```