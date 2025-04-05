import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const fixEvents = sqliteTable(
  "fix_events",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    sessionId: text("session_id").notNull(),
    type: text("type").notNull(),
    sourceCode: text("source_code").notNull(),
    sourceCompilerErrors: text("source_compiler_errors", {
      mode: "json",
    }).notNull(), // Assuming JSON is stored as TEXT
    analysis: text("analysis").notNull(),
    fixedCode: text("fixed_code"),
    fixedCompilerErrors: text("fixed_compiler_errors", { mode: "json" }), // Might be null if fix eliminates all errors
    createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    index("fix_events_session_id_index").on(table.sessionId),
    index("fix_events_type_index").on(table.type),
  ],
);

export type FixEvent = typeof fixEvents.$inferSelect;

export const rules = sqliteTable("rules", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  fixEventId: integer("fix_event_id")
    .notNull()
    .references(() => fixEvents.id),
  rule: text("rule").notNull(),
  reasoning: text("reasoning"),
  additionalData: text("additional_data", { mode: "json" }), // Assuming JSON is stored as TEXT
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export type Rule = typeof rules.$inferSelect;

// export const fixEventsRelations = relations(fixEvents, ({ many }) => ({
//   rules: many(rules),
// }));
