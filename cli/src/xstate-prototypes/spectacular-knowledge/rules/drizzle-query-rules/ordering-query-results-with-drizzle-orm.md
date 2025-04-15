# Drizzle SQLite Rules

## Ordering Query Results with Drizzle ORM

Sort query results using `orderBy()` with `asc()` and `desc()` functions.

- `orderBy(column)` sorts results in ascending order by default
- `desc(column)` specifies descending order
- `asc(column)` explicitly indicates ascending order
- Multiple ordering criteria can be passed to `orderBy()`

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/select)
- [Drizzle ORM SQLite Order By Documentation](https://orm.drizzle.team/docs/select#order-by)

- **Data Presentation**: Essential for displaying data in a meaningful order, such as newest-to-oldest or alphabetical.
- **Pagination**: Combining with limit and offset for consistent paginated results.
- **User Experience**: Improves user experience by presenting data in expected or useful sequences.

### Code Snippet

```typescript
import { desc, asc } from "drizzle-orm";
import { schema } from "./db/schema";

// Sort by single column in descending order
const newestFirst = await db.select()
  .from(schema.posts)
  .orderBy(desc(schema.posts.createdAt));

// Sort by multiple columns (category ascending, then price descending)
const organizedProducts = await db.select()
  .from(schema.products)
  .orderBy(
    asc(schema.products.category), 
    desc(schema.products.price)
  );

// Combine with limit for "top N" queries
const topSellers = await db.select()
  .from(schema.products)
  .orderBy(desc(schema.products.salesCount))
  .limit(5);
```

**Key Points:** The order of columns in `orderBy()` determines sort precedence. Always specify the table and column when using sorting functions. 