import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const fixes = sqliteTable(
  "fixes",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    sessionId: text("session_id").notNull(),
    type: text("type").notNull(),
    originalCode: text("original_code").notNull(),
    errors: text("errors", { mode: "json" }).notNull(), // Assuming JSON is stored as TEXT
    analysis: text("analysis").notNull(),
    fixedCode: text("fixed_code"),
    createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    index("fixes_session_id_index").on(table.sessionId),
    index("fixes_type_index").on(table.type),
  ],
);

export type Fix = typeof fixes.$inferSelect;

export const fixRules = sqliteTable("fix_rules", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  fixId: integer("fix_id")
    .notNull()
    .references(() => fixes.id),
  rule: text("rule").notNull(),
  additionalData: text("additional_data", { mode: "json" }), // Assuming JSON is stored as TEXT
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

// export const fixesRelations = relations(fixes, ({ many }) => ({
//   rules: many(fixRules),
// }));
