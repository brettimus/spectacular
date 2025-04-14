# Drizzle SQLite Rules

## Defining Columns with Numeric Type in SQLite

This document demonstrates how to define columns with the 'numeric' type in SQLite. The 'numeric' type is versatile, allowing for flexible storage and operation on numeric data within a table.

The code snippet creates a table named `table` with three columns, each using the 'numeric' type. The 'numeric' type is one of the supported storage types in SQLite, which can store any type of numeric data. It can auto-convert the stored data between integer and floating-point numbers based on need.

- SQLite uses dynamic typing. The 'numeric' storage class can store values as an integer, floating point, or text, depending on the value.
- While flexible, this can lead to unexpected results; it's crucial to ensure stored values are in the intended format.

- [SQLite Data Types](https://www.sqlite.org/datatype3.html)
- [Drizzle SQLite Column Types](https://drizzle.zhcndoc.com/docs/column-types/sqlite)

- Storing dynamic numeric data where precision and format may vary.
- Situations requiring data operations that involve various numeric types.

Other related column types include 'integer', 'real', and 'text', which may be used depending on the specific needs concerning precision and performance.

### Code Snippet

```typescript
CREATE TABLE `table` (
  `numeric` numeric,
  `numericNum` numeric,
  `numericBig` numeric,
);
```

**Reasoning:** This rule highlights the use of the 'numeric' column type in SQLite, which is important for defining columns that can store numbers, allowing for flexibility and precision in data storage. It demonstrates how to declare multiple columns with the same data type in a table.