## Defining Default Values for SQLite Columns

- Constant defaults: `integer().default(42)`
- SQL expression defaults: `integer().default(sql\`(abs(42))\`)`
- Default values must match column type
- SQLite-specific implementation

```typescript
import { sql } from "drizzle-orm";
import { integer, sqliteTable } from "drizzle-orm/sqlite-core";

const table = sqliteTable('table', {
  int1: integer().default(42),
  int2: integer().default(sql`(abs(42))`)
});
```