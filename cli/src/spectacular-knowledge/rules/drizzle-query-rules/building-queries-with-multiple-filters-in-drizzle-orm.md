# Drizzle SQLite Rules

## Building Queries with Multiple Filters in Drizzle ORM

Construct type-safe queries with dynamic filter conditions.

- Avoid reassigning query objects (causes TypeScript errors)
- Collect conditions in arrays and apply them in a single `where()` call
- Use `and()` and `or()` to combine multiple conditions

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/select)
- [Drizzle ORM SQLite Where Documentation](https://orm.drizzle.team/docs/select#where)

### Code Snippet

```typescript
import { eq, and, or, like, gte, lte } from "drizzle-orm";
import { schema } from "./db/schema";

// BAD: Reassigning query causes TypeScript errors
let query = db.select().from(schema.events);
if (typeFilter) {
  query = query.where(eq(schema.events.type, typeFilter)); // TypeScript error!
}
if (traceIdFilter) {
  query = query.where(eq(schema.events.traceId, traceIdFilter)); // TypeScript error!
}
query = query.limit(limit).offset(offset); // TypeScript error!

// GOOD: Collect conditions and apply them once
const conditions = [];
if (typeFilter) {
  conditions.push(eq(schema.events.type, typeFilter));
}
if (traceIdFilter) {
  conditions.push(eq(schema.events.traceId, traceIdFilter));
}

// Build query without reassignment
const query = db.select().from(schema.events);
const queryWithFilters = conditions.length
  ? query.where(conditions.length === 1 ? conditions[0] : and(...conditions))
  : query;
const events = await queryWithFilters.limit(limit).offset(offset);

// Combining OR and AND conditions
const searchConditions = [];
if (searchTerm) {
  searchConditions.push(like(schema.products.name, `%${searchTerm}%`));
  searchConditions.push(like(schema.products.description, `%${searchTerm}%`));
}

const priceConditions = [];
if (minPrice !== undefined) {
  priceConditions.push(gte(schema.products.price, minPrice));
}
if (maxPrice !== undefined) {
  priceConditions.push(lte(schema.products.price, maxPrice));
}

// Apply conditions in stages
const baseQuery = db.select().from(schema.products);
const queryWithSearch = searchConditions.length
  ? baseQuery.where(or(...searchConditions))
  : baseQuery;
const finalQuery = priceConditions.length
  ? queryWithSearch.where(and(...priceConditions))
  : queryWithSearch;

const products = await finalQuery;
```

**Key Points:** Build dynamic queries by collecting conditions in arrays before applying them. Use the ternary pattern to handle empty condition arrays. For complex queries with different condition types, build the query in stages without reassigning variables. 