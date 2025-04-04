import type { Context } from "@/deprecated-cli/context";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { traceAISDKModel } from "evalite/ai-sdk";
import { z } from "zod";
import { logAIInteraction } from "../../utils/logging";
import { createUserMessage } from "../utils";
import type { SelectedRule } from "./types";

export const GENERATE_SCHEMA_SYSTEM_PROMPT = `
You are a world class software engineer, and an expert in Drizzle ORM, a relational database query building library written in Typescript.

I will give you a written plan for a database schema, and you should turn it into code.

Here is a simple Drizzle database schema example for D1:

${getD1SchemaExample()}

Here are some additional code references:

${getDrizzleSchemaExamples()}

[IMPORTANT]
If you need the \`sql\` function, you must import it from \`drizzle-orm\`,
not \`drizzle-orm/sqlite-core\`.

\`\`\`typescript
// THIS IS INCORRECT
import { sqliteTable, text, integer, sql } from 'drizzle-orm/sqlite-core'

// THIS IS CORRECT
import {  sql } from 'drizzle-orm'
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
\`\`\`

[Additional Instructions]

Things you usually screw up (things to avoid):
- \`.primaryKey().autoIncrement()\` is NOT VALID for D1
  BETTER: use \`.primaryKey({ autoIncrement: true })\` instead
- Make sure all dependencies were properly imported
- IMPORTANT: \`import { sql } from "drizzle-orm"\`, not from \`drizzle-orm/sqlite-core'\`
`;

export async function generateSchema(
  ctx: Context,
  schemaSpecification: string,
  relevantRules: SelectedRule[],
) {
  const openai = createOpenAI({ apiKey: ctx.apiKey });
  const model = traceAISDKModel(openai("gpt-4o"));

  const input = {
    prompt: GENERATE_SCHEMA_SYSTEM_PROMPT,
    schemaSpecification,
    relevantRules,
  };

  const result = await generateObject({
    model,
    schema: z.object({
      explanation: z
        .string()
        .describe("Explanation of the schema design decisions"),
      dbSchemaTs: z
        .string()
        .describe("The generated Drizzle typescript schema definition."),
    }),
    messages: [
      createUserMessage(`Generate Drizzle ORM schema code for the following tables:
 
[BEGIN DATA]
************
[specification]:
${schemaSpecification}
************
[Additional context]:
${JSON.stringify(relevantRules, null, 2)}
************
[END DATA]

Things you usually screw up (things to avoid):
- \`.primaryKey().autoIncrement()\` is NOT VALID for D1
  BETTER: use \`.primaryKey({ autoIncrement: true })\` instead

Use the additional context to help you generate the schema. This is important to my career.
`),
    ],
    system: GENERATE_SCHEMA_SYSTEM_PROMPT,
    temperature: 0.2,
  });

  // Log the AI interaction
  logAIInteraction(ctx, "create-schema", "generate-schema", input, result);

  return result;
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
</example>
    `;
}

export function getD1SchemaExample() {
  return `
import { sql } from "drizzle-orm";
import { integer, text, sqliteTable, index } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email"),
  // This is how you define a json column
  metadata: text("metadata", { mode: "json" }),
  // This is how you define timestamp columns
  createdAt: text("created_at").notNull().default(sql\`(CURRENT_TIMESTAMP)\`),
  updatedAt: text("updated_at").notNull().default(sql\`(CURRENT_TIMESTAMP)\`),
}, (table) => [
  index("name_idx").on(table.name),
  uniqueIndex("email_idx").on(table.email),
]);
`.trim();
}
