## Setting Default Functions for SQLite Columns with Drizzle ORM

- Use `$defaultFn` to set dynamic default values for columns
- Common use case: auto-generating IDs, timestamps, or computed values
- Works with any synchronous function that returns the correct type

```typescript
import { text, sqliteTable } from "drizzle-orm/sqlite-core";
import { createId } from '@paralleldrive/cuid2';

const table = sqliteTable('table', {
  id: text().$defaultFn(() => createId()),
});
``` 