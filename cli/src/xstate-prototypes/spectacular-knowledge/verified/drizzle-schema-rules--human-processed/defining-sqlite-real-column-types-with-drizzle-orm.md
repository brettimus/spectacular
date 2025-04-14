## Defining SQLite REAL Column Types with Drizzle ORM

```typescript
import { real, sqliteTable } from "drizzle-orm/sqlite-core";

const table = sqliteTable('table', {
  real: real()
});
```
