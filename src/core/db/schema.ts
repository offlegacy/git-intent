import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { INTENT_STATUS } from "../constants";

const nowMs = sql`(strftime('%s','now') * 1000)`;

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  repoPath: text("repo_path").notNull().unique(),
  repoName: text("repo_name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(nowMs),
});

export const branches = sqliteTable(
  "branches",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(nowMs),
  },
  (table) => [unique("unq_branch_project").on(table.name, table.projectId)],
);

export const intents = sqliteTable("intents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  message: text("message").notNull(),
  status: text("status", { enum: INTENT_STATUS }).notNull(),
  branchId: text("branch_id").references(() => branches.id),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(nowMs),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Branch = typeof branches.$inferSelect;
export type NewBranch = typeof branches.$inferInsert;

export type Intent = typeof intents.$inferSelect;
export type NewIntent = typeof intents.$inferInsert;
