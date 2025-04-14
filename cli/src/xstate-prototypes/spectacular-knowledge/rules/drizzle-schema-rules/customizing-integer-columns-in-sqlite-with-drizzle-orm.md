## Customizing Integer Columns in SQLite with Drizzle ORM

How to create and customize integer columns in SQLite tables using Drizzle. By leveraging different modes, it is possible to store various types of data like numbers, booleans, and timestamps.

- `sqliteTable('table', {...})`: Defines a table named 'table' with specified columns.
- `integer()`: Creates an integer column by default.
- `integer({ mode: 'number' })`: Initializes the column in number mode, storing typical numeric values.
- `integer({ mode: 'boolean' })`: Initializes the column in boolean mode, allowing true/false values.
- `integer({ mode: 'timestamp_ms' })`: Sets the column to interpret values as timestamps in milliseconds.
- `integer({ mode: 'timestamp' })`: Allows the column to store Date objects directly.


- Storing user IDs or order numbers using `mode: 'number'`.
- Saving settings or flags in `mode: 'boolean'`.
- Logging timestamps for events with `mode: 'timestamp_ms'`.
- Tracking created or updated times directly using Date objects in `mode: 'timestamp'`.

```typescript
import { integer, sqliteTable } from "drizzle-orm/sqlite-core";

const table = sqliteTable('table', {
  id: integer()
});

// you can customize integer mode to be number, boolean, timestamp, timestamp_ms
integer({ mode: 'number' })
integer({ mode: 'boolean' })
integer({ mode: 'timestamp_ms' })
integer({ mode: 'timestamp' }) // Date
```
