# Drizzle SQLite Rules

## Type-Safe SQLite Column Definitions with Drizzle

This rule demonstrates how to define columns in a SQLite table using Drizzle, with a focus on type safety and structured data. By utilizing TypeScript's branding and type inference features, developers can enhance schema definitions and ensure consistency across their applications.

- **Branded Types**: The `UserId` type is defined using a TypeScript intersection type with a brand property. This ensures that only values explicitly marked as `UserId` can be assigned to it, promoting type safety.
- **Structured Data with JSON**: The `jsonField` column is declared as a blob, with a custom type `Data` that specifies its structure. This approach allows developers to enforce a specific structure for JSON data stored in the database.
- **Type Inference**: Drizzle leverages TypeScript's `$type` method to associate these custom types with database columns, ensuring that operations on these columns respect the defined types.

- **Branding Limitation**: Note that TypeScript's branding pattern is a compile-time construct and doesn’t enforce constraints at runtime.
- **JSON Handling**: Storing JSON data as a blob requires careful handling. Ensure that JSON is correctly serialized and deserialized when interacting with the database.

- [SQLite Column Types Documentation](https://drizzle.zhcndoc.com/docs/column-types/sqlite)
- [TypeScript Intersection Types](https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html)

- Defining primary keys with unique types to avoid assignment errors.
- Enforcing structure for JSON fields in SQLite, enhancing data integrity and simplifying querying logic.

By following this rule, developers can create robust and maintainable database schemas that leverage TypeScript's strengths to prevent common runtime errors and improve developer productivity.

### Code Snippet

```typescript
type UserId = number & { __brand: 'user_id' };
type Data = {
  foo: string;
  bar: number;
};

const users = sqliteTable('users', {
  id: integer().$type<UserId>().primaryKey(),
  jsonField: blob().$type<Data>(),
});
```

**Reasoning:** This rule demonstrates best practices for defining strongly typed columns in a SQLite table using Drizzle. By employing TypeScript's `& { __brand: 'custom_type' }` pattern for unique identifiers, such as `UserId`, and custom types for fields like JSON, developers can leverage TypeScript's type system to ensure type safety and prevent assignment of incorrect types. This pattern also showcases how database schema definitions can be enhanced with type information that guides development and reduces runtime errors.