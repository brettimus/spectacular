/**
 * Auth Rule for Drizzle Schema
 * 
 * This rule provides guidelines for creating authentication-related tables and fields
 * in a Drizzle ORM schema for Cloudflare D1.
 */

export const authRule = {
  name: "Authentication Rule",
  description: "Guidelines for creating authentication-related database tables",
  
  // Tables that should be created
  tables: [
    {
      name: "users",
      description: "Stores user account information",
      fields: [
        {
          name: "id",
          type: "text",
          isPrimary: true,
          description: "Primary user identifier, typically from an auth provider like Clerk"
        },
        {
          name: "email",
          type: "text",
          isRequired: true,
          description: "User's email address"
        },
        {
          name: "name",
          type: "text",
          isRequired: false,
          description: "User's full name"
        },
        {
          name: "created_at",
          type: "integer",
          isRequired: true,
          description: "Timestamp when the user was created"
        },
        {
          name: "updated_at",
          type: "integer",
          isRequired: true,
          description: "Timestamp when the user was last updated"
        }
      ]
    },
    {
      name: "sessions",
      description: "Stores session information for authenticated users",
      fields: [
        {
          name: "id",
          type: "text",
          isPrimary: true,
          description: "Unique session identifier"
        },
        {
          name: "user_id",
          type: "text",
          isRequired: true,
          isForeignKey: true,
          references: "users.id",
          description: "Reference to the user this session belongs to"
        },
        {
          name: "expires_at",
          type: "integer",
          isRequired: true,
          description: "Unix timestamp when the session expires"
        },
        {
          name: "created_at",
          type: "integer",
          isRequired: true,
          description: "Timestamp when the session was created"
        }
      ]
    }
  ],
  
  // Implementation guidance
  recommendations: [
    "Use Clerk as the authentication provider when possible",
    "Store minimal user data in the database, keeping most user data in the auth provider",
    "Use timestamps for created_at and updated_at fields (stored as integer for SQLite)",
    "Add unique index on email field",
    "Consider adding a user preferences table for user-specific settings"
  ],
  
  // Sample implementation
  sampleCode: `
// User table
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

// Session table
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull(),
});
  `
}; 