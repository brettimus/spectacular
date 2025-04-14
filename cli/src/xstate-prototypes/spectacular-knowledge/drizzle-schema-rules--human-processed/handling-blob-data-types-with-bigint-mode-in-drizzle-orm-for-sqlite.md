# Drizzle SQLite Rules

## Handling BLOB Data Types with 'bigint' Mode in Drizzle ORM for SQLite

This rule demonstrates how to define a column using the `blob` type with a 'bigint' mode in a table managed by Drizzle ORM for SQLite databases. This setup is essential for efficiently handling binary data like images, documents, or large integers stored in binary format.

- **Import Statements**: The code imports the `blob` type and `sqliteTable` function from the `drizzle-orm/sqlite-core` package.
- **Table Definition**: The `sqliteTable` function is used to define a new table named `table`.
- **Column Definition**: The `id` column is defined as a `blob` with `{ mode: 'bigint' }`. This means that the column will store binary data intended to represent large integers.

- **BLOB Usage**: Using a BLOB is ideal for any binary data storage necessary for the application, such as storing images, files, or large integer values.
- **Performance Considerations**: Be aware of potential performance implications when storing large BLOBs, and ensure that your database and application architecture can handle such payloads efficiently.

- [SQLite Documentation on BLOBs](https://www.sqlite.org/datatype3.html)
- [Drizzle ORM SQLite Documentation](https://drizzle.zhcndoc.com/docs/column-types/sqlite)

- Storing large integer values as BLOBs when precision or size surpasses the capabilities of standard integer data types.
- Saving binary large objects such as images, audio files, or documents in a database table for easy retrieval and processing.

- Using other modes or configurations with BLOB data types to accommodate different binary storage needs, such as handling different file types or encryption requirements.

### Code Snippet

```typescript
import { blob, sqliteTable } from "drizzle-orm/sqlite-core";

const table = sqliteTable('table', {
  id: blob({ mode: 'bigint' })
});
```

**Reasoning:** This rule demonstrates how to use the 'blob' data type with a 'bigint' mode in a Drizzle ORM SQLite setup. It highlights the flexibility of handling binary large objects within a database table, ensuring developers understand how to define and manipulate binary data effectively.