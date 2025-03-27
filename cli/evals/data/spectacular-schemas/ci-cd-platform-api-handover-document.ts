import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// Users Table
export const users = sqliteTable(
  "users",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    apiToken: text("api_token").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    uniqueIndex("users_email_index").on(table.email),
    uniqueIndex("users_api_token_index").on(table.apiToken),
  ],
);

// PipelineConfigs Table
export const pipelineConfigs = sqliteTable(
  "pipeline_configs",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    description: text("description"),
    yamlConfig: text("yaml_config").notNull(),
    createdBy: integer("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [index("pipeline_configs_created_by_index").on(table.createdBy)],
);

// PipelineRuns Table
export const pipelineRuns = sqliteTable(
  "pipeline_runs",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    pipelineConfigId: integer("pipeline_config_id")
      .notNull()
      .references(() => pipelineConfigs.id),
    triggeredBy: text("triggered_by").notNull(),
    status: text("status").notNull(),
    logs: text("logs"),
    startedAt: integer("started_at", { mode: "timestamp" }),
    finishedAt: integer("finished_at", { mode: "timestamp" }),
  },
  (table) => [
    index("pipeline_runs_pipeline_config_id_index").on(table.pipelineConfigId),
  ],
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  pipelineConfigs: many(pipelineConfigs),
}));

export const pipelineConfigsRelations = relations(
  pipelineConfigs,
  ({ many }) => ({
    pipelineRuns: many(pipelineRuns),
  }),
);
