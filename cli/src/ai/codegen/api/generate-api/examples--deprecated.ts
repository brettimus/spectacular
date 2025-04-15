
export function getDrizzleOrmExamples() {
  return `
// Example of inserting a new record:
await db.insert(schema.users).values({
  name: "John Doe",
  email: "john@example.com",
});

// Example of selecting records:
const users = await db.select().from(schema.users);

// Example of selecting with a filter:
const user = await db.select()
  .from(schema.users)
  .where(eq(schema.users.id, userId));

// Example of updating a record:
await db.update(schema.users)
  .set({ name: "Jane Doe" })
  .where(eq(schema.users.id, userId));

// Example of deleting a record:
await db.delete(schema.users)
  .where(eq(schema.users.id, userId));
`;
}

export function getCommonHonoMistakes() {
  return `
1. Don't use process.env, use c.env to access environment variables inside request handlers
2. Don't forget to add async/await for database operations
3. Don't include results of D1 queries with the .changed property, D1 queries don't have that
4. Remember to parse request bodies with await c.req.json()
5. Use proper error handling with try/catch blocks for database operations
6. Remember to return the response from each route handler
`;
}
