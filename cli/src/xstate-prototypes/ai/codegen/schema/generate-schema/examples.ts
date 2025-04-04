// Helper functions for providing examples
export function getD1SchemaExample() {
  return `
import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Define the users table
export const users = sqliteTable("users", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull().default(sql\`(CURRENT_TIMESTAMP)\`),
  updatedAt: text("updated_at").notNull().default(sql\`(CURRENT_TIMESTAMP)\`),
});

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

export function getDrizzleSchemaExamples() {
  return `
Here are some examples of how to use the Drizzle ORM to define tables:

<example type="numbers,booleans,timestamps">
  <typescript>
    import { integer, sqliteTable } from "drizzle-orm/sqlite-core";
    const table = sqliteTable('table', {
      // you can customize integer mode to be number, boolean, timestamp, timestamp_ms
      numberCol: integer("number_col", { mode: 'number' })
      booleanCol: integer("boolean_col", { mode: 'boolean' })
      timestampMsCol: integer("timestamp_ms_col", { mode: 'timestamp_ms' })
      timestampCol: integer("timestamp_col", { mode: 'timestamp' }) // Date 
      createdAt: text("created_at").notNull().default(sql\`(CURRENT_TIMESTAMP)\`),
      updatedAt: text("updated_at").notNull().default(sql\`(CURRENT_TIMESTAMP)\`),
    });
  </typescript>
  <sql>
    CREATE TABLE \`table\` (
      \`number_col\` integer,
      \`boolean_col\` integer,
      \`timestamp_ms_col\` integer,
      \`timestamp_col\` integer,
      \`created_at\` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
      \`updated_at\` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
    );
  </sql>
</example>
<example type="indexes">
  <description>
    Drizzle ORM provides you an API to define indexes on tables.
  </description>
  <typescript>
    import { integer, text, index, uniqueIndex, sqliteTable } from "drizzle-orm/sqlite-core";
    export const user = sqliteTable("user", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      name: text("name"),
      email: text("email"),
    }, (table) => [
      index("name_idx").on(table.name),
      uniqueIndex("email_idx").on(table.email),
    ]);
  </typescript>
</example>
${getDrizzleRelationsExample()}
`;
}

function getDrizzleRelationsExample() {
  return `
<example type="relations" relationType="one-to-one">
  <description>
    An example of a one-to-one relation between users and users, where a user can invite another (this example uses a self reference):
  </description>
  <typescript>
    import { sqliteTable, text, integer, boolean } from 'drizzle-orm/sqlite-core';
    import { relations } from 'drizzle-orm';
    export const users = sqliteTable('users', {
      id: integer("id", { mode: "number" }).primaryKey(),
      name: text('name'),
      invitedBy: integer('invited_by'),
    });
    export const usersRelations = relations(users, ({ one }) => ({
      invitee: one(users, {
        fields: [users.invitedBy],
        references: [users.id],
      }),
    }));
  </typescript>
</example>
<example type="relations" relationType="many-to-one">
  <description>
      Drizzle ORM provides you an API to define one-to-many relations between tables with relations operator.
      Example of one-to-many relation between users and posts they've written,
      and comments on those posts..
  </description>
  <typescript>
    import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
    import { relations } from 'drizzle-orm';
    export const users = sqliteTable('users', {
      id: integer("id", { mode: "number" }).primaryKey(),
      name: text('name'),
    });
    export const usersRelations = relations(users, ({ many }) => ({
      posts: many(posts),
    }));
    export const posts = sqliteTable('posts', {
      id: integer("id", { mode: "number" }).primaryKey(),
      content: text('content'),
      authorId: integer('author_id'),
    });
    export const postsRelations = relations(posts, ({ one, many }) => ({
      author: one(users, {
        fields: [posts.authorId],
        references: [users.id],
      }),
      comments: many(comments)
    }));
    export const comments = sqliteTable('comments', {
      id: integer("id", { mode: "number" }).primaryKey(),
      text: text('text'),
      authorId: integer('author_id'),
      postId: integer('post_id'),
    });
    export const commentsRelations = relations(comments, ({ one }) => ({
      post: one(posts, {
        fields: [comments.postId],
        references: [posts.id],
      }),
    }));
  </typescript>
</example>
<example type="relations" relationType="many-to-many">
  <description>
    Drizzle ORM provides you an API to define many-to-many relations between tables through so called junction or join tables, they have to be explicitly defined and store associations between related tables.
    Example of many-to-many relation between users and groups:
  </description>
  <typescript>
      import { relations } from 'drizzle-orm';
      import { integer, sqliteTable, primaryKey, text } from 'drizzle-orm/sqlite-core';
      export const users = sqliteTable('users', {
        id: integer("id", { mode: "number" }).primaryKey(),
        name: text('name'),
      });
      export const usersRelations = relations(users, ({ many }) => ({
        usersToGroups: many(usersToGroups),
      }));
      export const groups = sqliteTable('groups', {
        id: integer("id", { mode: "number" }).primaryKey(),
        name: text('name'),
      });
      export const groupsRelations = relations(groups, ({ many }) => ({
        usersToGroups: many(usersToGroups),
      }));
      export const usersToGroups = sqliteTable(
        'users_to_groups',
        {
          userId: integer('user_id')
            .notNull()
            .references(() => users.id),
          groupId: integer('group_id')
            .notNull()
            .references(() => groups.id),
        },
        (t) => ({
          pk: primaryKey({ columns: [t.userId, t.groupId] }),
        }),
      );
      export const usersToGroupsRelations = relations(usersToGroups, ({ one }) => ({
        group: one(groups, {
          fields: [usersToGroups.groupId],
          references: [groups.id],
        }),
        user: one(users, {
          fields: [usersToGroups.userId],
          references: [users.id],
        }),
      }));
  </typescript>
</example>`;
}

export function getD1AdditionalTips() {
  return `
If you need the \`sql\` function, you must import it from \`drizzle-orm\`,
not \`drizzle-orm/sqlite-core\`.

\`\`\`typescript
// THIS IS INCORRECT
import { sqliteTable, text, integer, sql } from 'drizzle-orm/sqlite-core'

// THIS IS CORRECT
import {  sql } from 'drizzle-orm'
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
\`\`\`

If you use an autoincrementing primary key, pass the \`autoIncrement\` option to \`.primaryKey\`

\`\`\`
import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// INCORRECT - autoIncrement is NOT a function
export const users = sqliteTable("users", {
  id: integer("id", { mode: "number" }).primaryKey().autoIncrement(),
});

// CORRECT - autoIncrement is passed as an option
export const users = sqliteTable("users", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
});
\`\`\`


You can export types for insert operations using \`.inferSelect\`

\`\`\`
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const events = sqliteTable(
  "events",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    jsonData: text("json_data", { mode: "json" }).notNull(),
    createdAt: text("created_at").notNull().default(sql\`(CURRENT_TIMESTAMP)\`),
  }
);

// This is the type for data to be inserted into the database
export type EventSelect = typeof events.$inferSelect;
\`\`\`
`;
}
