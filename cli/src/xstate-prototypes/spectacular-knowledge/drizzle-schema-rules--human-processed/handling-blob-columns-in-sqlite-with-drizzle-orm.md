# Drizzle SQLite Rules

## Handling Blob Columns in SQLite with Drizzle ORM

This code snippet demonstrates how to define blob columns in a SQLite database using Drizzle ORM. It shows various ways to configure blob columns, highlighting the flexibility offered by the library.

- **Definition of Blob Column**: The `blob()` function is used to create a blob column in a SQLite table.
- **Modes of Blob Storage**:
  - `blob()`: Default blob configuration.
  - `blob({ mode: 'buffer' })`: Stores the blob as a buffer.
  - `blob({ mode: 'bigint' })`: Assumes the blob data can be represented as a bigint.
  - `blob({ mode: 'json' })`: Interprets the blob data as JSON.
- **Custom Type Definition**: The `$type` method allows for specifying a custom TypeScript type for the JSON blob, enhancing type safety and readability.

- Ensure that the Drizzle ORM library is correctly installed and configured in your TypeScript project before using these features.
- Be aware of the database's storage limitations and performance considerations when using blobs, especially for large data.

- [Drizzle ORM SQLite Documentation](https://drizzle.zhcndoc.com/docs/column-types/sqlite)
- [Blob Data Type in SQLite](https://www.sqlite.org/datatype3.html)

- Storing binary files such as images or documents directly in the database.
- Encoding structured data as JSON for storage in a blob column.
- Applications requiring type-safe interactions with binary data through TypeScript.

By following this rule, developers can effectively leverage SQLite's support for binary data using Drizzle ORM, ensuring optimal application performance and maintainability.

### Code Snippet

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

**Reasoning:** This rule is important because it demonstrates how to define and manipulate blob columns in a SQLite database using Drizzle ORM. Understanding the different modes of blob storage and how to define custom types is crucial for effectively using SQLite for a wide range of applications that require binary data handling.