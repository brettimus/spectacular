export function getD1SchemaExample() {
  return `
import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Define the users table
export const users = sqliteTable("users", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull().default(sql\`(CURRENT_TIMESTAMP)\`),
  updatedAt: text("updated_at").notNull().default(sql\`(CURRENT_TIMESTAMP)\`),
}, t => [
  // example of adding an index to email column
  index("email_idx").on(t.email),
]);

// Define the posts table
export const posts = sqliteTable("posts", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").notNull().references(() => users.id),
  createdAt: text("created_at").notNull().default(sql\`(CURRENT_TIMESTAMP)\`),
  updatedAt: text("updated_at").notNull().default(sql\`(CURRENT_TIMESTAMP)\`),
});

// Define relations for users
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

// Define relations for posts
export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));
`;
}
