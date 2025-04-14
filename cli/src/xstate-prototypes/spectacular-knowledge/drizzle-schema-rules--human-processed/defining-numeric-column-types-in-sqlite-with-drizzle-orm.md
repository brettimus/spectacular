# Drizzle SQLite Rules

## Defining Numeric Column Types in SQLite with Drizzle ORM

This document demonstrates how to define various numeric column types in a SQLite table using Drizzle ORM in a TypeScript environment.

This code snippet shows how to create a SQLite table with columns that use different numeric types controlled by Drizzle ORM. Here's a breakdown of the column definitions:

- `numeric`: Defaults to a general numeric type.
- `numericNum`: Specifies numeric type in `number` mode, implying traditional floating-point or fixed-point arithmetic.
- `numericBig`: Specifies numeric type in `bigint` mode, which is optimal for very large numbers that require precise integer arithmetic.

- **Type Safety**: Using specific modes like 'number' and 'bigint' enhances type safety, preventing potential errors in handling numerics.
- **Compatibility**: Ensure your TypeScript environment is properly set up to utilize Drizzle ORM.

- [Drizzle ORM SQLite Column Types](https://drizzle.zhcndoc.com/docs/column-types/sqlite)
- [Drizzle ORM GitHub Repository](https://github.com/drizzle-team/drizzle)

- Defining columns for a finance application where precision in decimal and integer operations is crucial.
- Creating tables for scientific data storage, utilizing large integer columns for massive datasets or identifiers.

### Code Snippet

```typescript
import { blob, sqliteTable } from "drizzle-orm/sqlite-core";

const table = sqliteTable('table', {
  numeric: numeric(),
  numericNum: numeric({ mode: 'number' }),
  numericBig: numeric({ mode: 'bigint' }),
});
```

**Reasoning:** This rule is important because it demonstrates how to define a SQLite table with different numeric column types using Drizzle ORM. It highlights the flexibility and clarity provided by Drizzle's type definitions, which improve type safety and the accuracy of SQL operations in a TypeScript environment.