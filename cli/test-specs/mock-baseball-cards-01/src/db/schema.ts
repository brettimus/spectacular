import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const baseballCards = sqliteTable('baseball_cards', {
  id: text('id').primaryKey().notNull(), // UUID as primary key
  playerName: text('player_name').notNull(),
  team: text('team').notNull(),
  year: integer('year', { mode: 'number' }).notNull(),
  condition: text('condition').notNull(),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`),
});