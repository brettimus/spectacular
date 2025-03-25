import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const events = sqliteTable('events', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  conversationId: text('conversation_id').notNull(),
  eventType: text('event_type').notNull(),
  timestamp: text('timestamp').notNull(),
  data: text('data'), // Assuming TEXT for simplicity, could be JSON
}, (table) => ({
  conversationIdIndex: table.index('events_conversation_id_index').on(table.conversationId),
  eventTypeIndex: table.index('events_event_type_index').on(table.eventType),
}));

export const feedback = sqliteTable('feedback', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  eventId: integer('event_id').notNull().references(() => events.id),
  feedbackMessage: text('feedback_message').notNull(),
  submittedAt: text('submitted_at').notNull(),
  status: text('status').notNull(),
});

// Define relations
import { relations } from 'drizzle-orm';

export const feedbackRelations = relations(feedback, ({ one }) => ({
  event: one(events, {
    fields: [feedback.eventId],
    references: [events.id],
  }),
}));