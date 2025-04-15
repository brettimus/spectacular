## Always Null Column in SQLite with Drizzle ORM

Defines a column in an SQLite table that will always be null when updated.

```typescript
import { text, sqliteTable } from "drizzle-orm/sqlite-core";

const table = sqliteTable('table', {
    alwaysNull: text().$type<string | null>().$onUpdate(() => null),
});
```

- Uses `$type<string | null>()` to allow null values
- `$onUpdate(() => null)` forces the column to null on record updates
- Works with any column type, not just text