# Drizzle SQLite Rules

## Defining Non-Nullable Integer Columns in SQLite Tables Using Drizzle ORM

This rule demonstrates how to define a non-nullable integer column in a SQLite table using Drizzle ORM. This practice is crucial to enforce data integrity by ensuring that critical fields receive valid integer inputs and do not have null values.

- **`sqliteTable`**: A function to define a new SQLite table.
- **`numInt`**: The name of the column, indicating it stores numerical integer values.
- **`integer()`**: Specifies that the column type is `INTEGER`, a built-in type in SQLite.
- **`notNull()`**: Ensures that the `numInt` column cannot have `NULL` values, forcing data input for every row in the table.

- **Data Integrity**: Using `notNull()` helps maintain data integrity by preventing `NULL` entries in essential columns.
- Always ensure that your ORM or database driver is correctly set up to support type definitions and constraints.

- [Drizzle SQLite Documentation](https://drizzle.zhcndoc.com/docs/column-types/sqlite)
- [SQLite Data Types](https://sqlite.org/datatype3.html)

- Defining columns in user tables where IDs or other numerical identifiers must always be present.
- Ensuring that financial transactions have valid amounts without null entries.

- Defining other non-nullable types, such as `text().notNull()` for string values.

### Code Snippet

```typescript
const table = sqliteTable('table', { 
  numInt: integer().notNull() 
});
```

**Reasoning:** This rule highlights how to define a non-nullable integer column in a SQLite table using Drizzle ORM. It demonstrates the importance of ensuring data integrity by preventing null values in columns that require mandatory information.