## Automating Date and Time Defaults in SQLite

Set default date/time values using SQLite's built-in functions:

- text().default(sql`(CURRENT_TIME)`): Sets default to current time
- text().default(sql`(CURRENT_DATE)`): Sets default to current date
- text().default(sql`(CURRENT_TIMESTAMP)`): Sets default to current timestamp

```typescript
import { sql } from "drizzle-orm";
import { text, sqliteTable } from "drizzle-orm/sqlite-core";

const table = sqliteTable("table", {
  time: text().default(sql`(CURRENT_TIME)`),
  date: text().default(sql`(CURRENT_DATE)`),
  timestamp: text().default(sql`(CURRENT_TIMESTAMP)`),
});
```