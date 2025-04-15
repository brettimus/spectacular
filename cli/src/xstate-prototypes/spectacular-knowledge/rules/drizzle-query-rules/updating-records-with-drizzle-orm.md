# Drizzle SQLite Rules

## Updating Records with Drizzle ORM

Update existing records using the `update()` method with targeted conditions.

- `db.update(table)` starts an update operation
- `set()` specifies columns and values to update
- `where()` targets specific records (always use this!)
- `returning()` returns updated records in a single operation

- Always include a `where` clause with your update operations unless you truly intend to update all records.
- Use type-safe column references from your schema to avoid typos and ensure type checking.
- Consider using the `returning()` method if you need the updated records immediately after the update.

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/update)
- [Drizzle ORM SQLite Update Documentation](https://orm.drizzle.team/docs/update)

- **Data Modification**: Updating existing records with new information.
- **Batch Updates**: Applying the same change to multiple records matching a condition.
- **Stateful Operations**: Combined with `returning()`, can be used to update and retrieve in a single operation.

### Code Snippet

```typescript
import { eq, sql } from "drizzle-orm";
import { schema } from "./db/schema";

// Basic update with returning
const [updatedUser] = await db.update(schema.users)
  .set({ name: "John" })
  .where(eq(schema.users.id, id))
  .returning();

console.log("Updated user:", updatedUser);

// Update multiple columns
await db.update(schema.products)
  .set({ 
    price: 29.99,
    updatedAt: new Date()
  })
  .where(eq(schema.products.id, productId));

// Update multiple records matching a condition
await db.update(schema.tasks)
  .set({ status: "archived" })
  .where(eq(schema.tasks.completed, true));

// SQL expressions for calculated updates
await db.update(schema.inventory)
  .set({ 
    quantity: sql`${schema.inventory.quantity} - 1`
  })
  .where(eq(schema.inventory.productId, productId));
```

**Key Points:** Always include a `where` clause unless you truly intend to update all records. Use type-safe column references to ensure type checking. The `returning()` method is useful when you need the updated data immediately. 