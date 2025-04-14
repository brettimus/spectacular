## Handling JSON Columns in SQLite

How to create a text column in SQLite with Drizzle.

- You can define `{ mode: 'json' }` on a text column to store JSON. (THIS IS THE PREFFERED WAY TO STORE JSON IN SQLITE).

- You can define `.$type<..>()` for text inference, it won’t check runtime values. It provides compile time protection for default values, insert and select schemas.

```typescript
import { text, sqliteTable } from "drizzle-orm/sqlite-core";
const table = sqliteTable('table', {
	data: text({ mode: 'json' })
});

// also possible:
text({ mode: 'json' }).$type<{ foo: string }>()
```