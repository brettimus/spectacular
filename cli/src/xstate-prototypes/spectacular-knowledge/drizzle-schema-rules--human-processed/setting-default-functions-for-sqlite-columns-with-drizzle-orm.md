# Drizzle SQLite Rules

## Setting Default Functions for SQLite Columns with Drizzle ORM

This code snippet demonstrates how to set up a SQLite table with a default function for generating values for a column using Drizzle ORM.

- **Import Statements**: The code imports necessary functions from 'drizzle-orm/sqlite-core' and '@paralleldrive/cuid2'.
- **sqliteTable Function**: Used to define a new SQLite table named 'table'.
- **Column Definition**: The `id` column is of type `text`, with a default function that generates a unique identifier using `createId()`.

- The use of `defaultFn` allows automatic assignment of values, reducing manual entry errors.
- Ensure the `@paralleldrive/cuid2` library is installed and properly configured in your environment, as it provides the `createId()` function.

- [Drizzle ORM Documentation](https://drizzle.zhcndoc.com/docs)
- [cuid2 Documentation](https://www.npmjs.com/package/@paralleldrive/cuid2)

- **Unique Identifier Generation**: Automatically generate unique IDs for primary keys.
- **Timestamp Assignment**: Use for default timestamps in records.

- **UUIDs**: Use UUID libraries for ID generation instead of `cuid2`.
- **Default Boolean/Integer Values**: Define other default values such as `boolean().$default(true)` or `integer().$default(0)`.

### Code Snippet

```typescript
import { text, sqliteTable } from "drizzle-orm/sqlite-core";
import { createId } from '@paralleldrive/cuid2';

const table = sqliteTable('table', {
  id: text().$defaultFn(() => createId()),
});
```

**Reasoning:** This rule is important as it demonstrates how to define a default value generation for a SQLite table column using Drizzle ORM. It showcases the usage of custom functions to automatically assign values, which can be particularly useful for unique identifiers.