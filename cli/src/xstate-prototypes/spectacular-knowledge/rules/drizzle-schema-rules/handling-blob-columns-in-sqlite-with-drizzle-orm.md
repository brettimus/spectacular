# Drizzle SQLite Rules

## Handling Blob Columns in SQLite with Drizzle ORM

- The `blob()` function is used to create a blob column in a SQLite table.

- **Modes of Blob Storage**:
  - `blob()`: Default blob configuration.
  - `blob({ mode: 'buffer' })`: Stores the blob as a buffer.
  - `blob({ mode: 'bigint' })`: Assumes the blob data can be represented as a bigint.
  - `blob({ mode: 'json' })`: Interprets the blob data as JSON.

- **Custom Type Definition**: The `$type` method allows for specifying a custom TypeScript type for the JSON blob, enhancing type safety and readability.

- Be aware of the database's storage limitations and performance considerations when using blobs, especially for large data.

- Storing binary files such as images or documents directly in the database.

- Encoding structured data as JSON for storage in a blob column.

```typescript
import { blob, sqliteTable } from "drizzle-orm/sqlite-core";

const table = sqliteTable('table', {
  blob: blob()
});

blob()
blob({ mode: 'buffer' })
blob({ mode: 'bigint' })

blob({ mode: 'json' })
blob({ mode: 'json' }).$type<{ foo: string }>()
```

- It’s recommended to use text('', { mode: 'json' }) instead of blob('', { mode: 'json' }), because it supports JSON functions. All JSON functions currently throw an error if any of their arguments are BLOBs because BLOBs are reserved for a future enhancement in which BLOBs will store the binary encoding for JSON.

- You can specify `.$type<..>()` for blob inference, it won’t check runtime values. It provides compile time protection for default values, insert and select schemas.

