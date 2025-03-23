/**
 * Realtime Data Rule for Drizzle Schema
 *
 * This rule provides guidelines for creating tables and fields that support
 * realtime updates using Cloudflare Durable Objects.
 */

export const realtimeRule = {
  name: "Realtime Data Rule",
  description:
    "Guidelines for creating database tables that support realtime updates",

  // Fields that should be added to tables that need realtime updates
  realtimeFields: [
    {
      name: "updated_at",
      type: "integer",
      isRequired: true,
      description:
        "Timestamp to track when a record was last updated (used for sync)",
    },
    {
      name: "version",
      type: "integer",
      isRequired: true,
      description: "Optimistic concurrency control version number",
    },
  ],

  // Implementation guidance
  recommendations: [
    "Use Cloudflare Durable Objects for maintaining realtime state",
    "Add a version field to tables for optimistic concurrency control",
    "Use timestamps for change tracking",
    "Consider using a separate 'changes' table to track updates for sync",
    "Add indexes to fields that will be queried for recent changes",
  ],

  // Sample implementation for a changes tracking table
  sampleCode: `
// Changes tracking table for realtime sync
export const changes = sqliteTable("changes", {
  id: text("id").primaryKey(),
  tableName: text("table_name").notNull(),
  recordId: text("record_id").notNull(),
  operation: text("operation").notNull(), // 'create', 'update', 'delete'
  timestamp: integer("timestamp").notNull(),
  version: integer("version").notNull(),
});

// Index for efficient change queries
export const changesTableNameIndex = createIndex("changes_table_name_idx")
  .on(changes)
  .columns([changes.tableName, changes.timestamp]);
  `,
};
