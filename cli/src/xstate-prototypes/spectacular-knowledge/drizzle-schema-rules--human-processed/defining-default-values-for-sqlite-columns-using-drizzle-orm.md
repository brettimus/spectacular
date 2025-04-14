# Drizzle SQLite Rules

## Defining Default Values for SQLite Columns Using Drizzle ORM

This rule demonstrates how to define default values for columns in a SQLite table using Drizzle ORM. It covers the use of both constant values and SQL expressions.

- **Constant Default Value:** The `int1` column is defined with a default value of `42`. This is a straightforward method where a constant is assigned as the default.

- **SQL Expression as Default Value:** The `int2` column uses a SQL expression `sql` to compute its default value. This allows for dynamic default values using SQLite functions or operations, providing more flexibility.

- **Type Safety:** Ensure that the default value matches the column type to prevent runtime errors.

- **Performance Considerations:** While using SQL expressions for defaults can be powerful, it may have performance implications depending on the complexity of the expressions.

- **Database Compatibility:** This pattern is SQLite-specific; check compatibility if migrating to another database system.

- [Drizzle ORM Documentation](https://drizzle.zhcndoc.com/docs/)
- [SQLite Column Types](https://drizzle.zhcndoc.com/docs/column-types/sqlite)

- **Setting Default Numeric Values:** Use constant defaults for columns where a common numeric value is expected.
- **Dynamic Defaults:** Use SQL expressions to calculate defaults based on other parameters or conditions, such as timestamps or computed averages.

By understanding these methods, developers can make informed decisions on how to initialize database columns effectively.

### Code Snippet

```typescript
import { sql } from "drizzle-orm";
import { integer, sqliteTable } from "drizzle-orm/sqlite-core";

const table = sqliteTable('table', {
  int1: integer().default(42),
  int2: integer().default(sql`(abs(42))`)
});
```

**Reasoning:** This rule is important as it illustrates how to define default values for columns in a SQLite table using Drizzle ORM. It demonstrates two methods: using a constant value and using a SQL expression. Understanding these methods is crucial for setting default behaviors in database applications, ensuring that tables have meaningful default data, and leveraging SQL functions for dynamic defaults.