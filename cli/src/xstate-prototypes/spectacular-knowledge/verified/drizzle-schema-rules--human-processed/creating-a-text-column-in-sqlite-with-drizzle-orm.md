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

- You can define `{ enum: ["value1", "value2"] }` config to infer insert and select types, it won’t check runtime values.

- You can define `{ mode: 'json' }` to store JSON. (THIS IS THE PREFFERED WAY TO STORE JSON IN SQLITE).

- You can define `.$type<..>()` for text inference, it won’t check runtime values. It provides compile time protection for default values, insert and select schemas.

```typescript
import { text, sqliteTable } from "drizzle-orm/sqlite-core";
const table = sqliteTable('table', {
	text: text()
});
// will be inferred as text: "value1" | "value2" | null
text({ enum: ["value1", "value2"] })
text({ mode: 'json' })
text({ mode: 'json' }).$type<{ foo: string }>()
```