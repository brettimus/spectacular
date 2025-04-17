## Setting Default Functions for SQLite Columns with Drizzle ORM

- Use `$defaultFn` to set dynamic default values for columns
- Common use case: auto-generating IDs, timestamps, or computed values
- Works with any synchronous function that returns the correct type

```typescript
import { text, sqliteTable } from "drizzle-orm/sqlite-core";

const table = sqliteTable('table', {
  uuid: text().$defaultFn(() => crypto.randomUUID()),
});
``` 