import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const events = sqliteTable("events", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  conversationId: text("conversation_id").notNull(),
  eventType: text("event_type").notNull(),
  timestamp: text("timestamp").notNull(),
  data: text("data"),
}, (table) => ({
  conversationIdIndex: table.index("events_conversation_id_idx").on(table.conversationId),
  eventTypeIndex: table.index("events_event_type_idx").on(table.eventType),
}));

export const feedback = sqliteTable("feedback", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  eventId: integer("event_id").notNull().references(() => events.id),
  feedbackMessage: text("feedback_message").notNull(),
  submittedAt: text("submitted_at").notNull(),
  status: text("status").notNull(),
});