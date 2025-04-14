# Drizzle SQLite Rules

## Defining SQLite REAL Column Types with Drizzle ORM

This rule demonstrates how to define and use a REAL column type in an SQLite table using the Drizzle ORM. It is essential to understand how to work with various data types in SQLite to leverage the full potential of the database while maintaining type safety and clarity in TypeScript.

- **Import Statements**: The code starts by importing the `real` function and `sqliteTable` from the Drizzle ORM SQLite core package.
- **Table Definition**: A table is defined with the `sqliteTable()` function, which takes the table name ('table') and an object defining the schema. The `real()` function specifies that the column named 'real' should have the SQLite REAL data type, which is used to store floating-point numbers.

- **Precision**: REAL types store floating point numbers, which might cause precision issues in certain calculations.
- **Compatibility**: Always ensure compatibility with the SQLite database version being used, as behavior may differ slightly with different versions.

- [Drizzle ORM SQLite Documentation](https://drizzle.zhcndoc.com/docs/column-types/sqlite)
- [SQLite Data Types](https://www.sqlite.org/datatype3.html)

- **Storing Decimal Numbers**: Use REAL for prices, measurements, or other decimal values where the precision offered by floating point numbers is sufficient.
- **Alternative Types**: For more precise numeric storage, consider using `integer` for whole numbers or `numeric` for fixed-point arithmetic.

### Code Snippet

```typescript
import { real, sqliteTable } from "drizzle-orm/sqlite-core";

const table = sqliteTable('table', {
  real: real()
});
```

**Reasoning:** This rule is important because it demonstrates how to define a table with a REAL column type in SQLite using the Drizzle ORM. This is critical for developers who need to handle floating point numbers and integrations with databases using a type-safe approach.