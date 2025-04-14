# Drizzle SQLite Rules

## Defining SQLite Column Types with Drizzle ORM

This rule demonstrates how to use the Drizzle ORM library to define SQLite table columns with specific types and modifications. It shows how to set up columns with enumerated values and handle JSON data types effectively.

- **`sqliteTable`**: This function is used to create a table in SQLite, specifying the table name and its columns.
- **`text` Column**: The `text` function defines a column with the text data type. It can be customized using options like `enum` and `mode`.
  - **`enum` Option**: Restricts the column values to specific enumerated strings (e.g., "value1", "value2") and allows `null`.
  - **`mode: 'json'`**: Defines the column to store JSON data, enabling the storage of serialized objects in a text field.
  - **`$type<{ foo: string }>()`**: Specifies the TypeScript type for JSON data to ensure type safety when accessing JSON properties.

- Ensure that the database type supports all JSON functionalities when using `mode: 'json'`.
- Using the `enum` option helps prevent invalid data entry, enhancing data integrity.

- [Drizzle ORM SQLite Column Types Documentation](https://drizzle.zhcndoc.com/docs/column-types/sqlite)

- **Enumerated Text Column**: Useful for fields with a fixed set of possible values, like status or category.
- **JSON Text Column**: Ideal for storing configuration data or complex objects without needing a separate relational structure.

This pattern is especially beneficial when working with dynamic data structures or ensuring data integrity through type restrictions.

### Code Snippet

```typescript
import { text, sqliteTable } from "drizzle-orm/sqlite-core";

const table = sqliteTable('table', {
  text: text()
});

// will be inferred as text: "value1" | "value2" | null
text({ enum: ["value1", "value2"] })
text({ mode: 'json' })
text({ mode: 'json' }).$type<{ foo: string }>()
```

**Reasoning:** This rule highlights the use of the Drizzle ORM library for creating and managing SQLite tables with TypeScript. It showcases how to define a table with columns that have specified data types and customizations, such as enumerations and JSON mode. This rule is important for developers who want to leverage TypeScript's typing system for better type safety and readability in database operations with SQLite.