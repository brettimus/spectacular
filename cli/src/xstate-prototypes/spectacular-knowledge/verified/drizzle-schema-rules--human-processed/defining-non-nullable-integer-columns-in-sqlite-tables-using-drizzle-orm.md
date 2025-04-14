## Defining Non-Nullable Integer Columns in SQLite Tables Using Drizzle ORM

- `sqliteTable`: Creates a new SQLite table
- `integer()`: Defines an INTEGER column type
- `notNull()`: Makes the column non-nullable
  - Can be combined with other column modifiers 


```typescript
const table = sqliteTable('table', { 
  numInt: integer().notNull() 
});
```
