# Drizzle SQLite Rules

## Filtering with Comparison Operators in Drizzle ORM

Filter records using comparison operators for numeric and date ranges.

- `gt()` - Greater than (>)
- `gte()` - Greater than or equal to (>=)
- `lt()` - Less than (<)
- `lte()` - Less than or equal to (<=)
- `between()` - Value falls within a range

- Choose the appropriate comparison operator based on whether you want to include or exclude the boundary value.
- For date ranges, use date objects or ISO strings that SQLite can properly compare.
- Consider using indexes on frequently filtered columns to improve query performance.

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/select)
- [Drizzle ORM SQLite Filtering Documentation](https://orm.drizzle.team/docs/select#where)

- **Range Queries**: Perfect for finding records within specific ranges (price ranges, date ranges).
- **Data Analysis**: Used in analytical queries to segment data (e.g., customers by age groups).
- **Pagination**: Can be used with timestamps for cursor-based pagination.

### Code Snippet

```typescript
import { gt, gte, lt, lte, between } from "drizzle-orm";
import { schema } from "./db/schema";

// Find expensive products (price >= 1000)
const expensiveProducts = await db.select()
  .from(schema.products)
  .where(gte(schema.products.price, 1000));

// Find recent users (created within last 7 days)
const oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
const newUsers = await db.select()
  .from(schema.users)
  .where(gt(schema.users.createdAt, oneWeekAgo));

// Find products in a price range
const midRangeProducts = await db.select()
  .from(schema.products)
  .where(between(schema.products.price, 100, 500));

// Find items that need restocking
const lowStockItems = await db.select()
  .from(schema.inventory)
  .where(lt(schema.inventory.quantity, schema.inventory.reorderThreshold));
```

**Reasoning:** Comparison operators are essential for creating meaningful filters that go beyond exact matches. This rule demonstrates how to use Drizzle ORM's comparison functions to create SQL conditions that filter based on ranges and thresholds. These patterns are commonly used in e-commerce, reporting, and data analysis features of applications. 

**Key Points:** Choose the appropriate operator based on whether boundary values should be included. For date ranges, use JavaScript Date objects that SQLite can compare properly. Consider adding indexes on frequently filtered columns. 