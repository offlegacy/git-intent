import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { INTENT_STATUS } from "../../types";

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  repoPath: text("repo_path").notNull().unique(),
  repoName: text("repo_name").notNull(),
});

export const branches = sqliteTable("branches", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id),
  name: text("name").notNull(),
});

export const intents = sqliteTable("intents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  message: text("message").notNull(),
  status: text("status", { enum: INTENT_STATUS }).notNull(),
  branchId: text("branch_id").references(() => branches.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Branch = typeof branches.$inferSelect;
export type NewBranch = typeof branches.$inferInsert;

export type Intent = typeof intents.$inferSelect;
export type NewIntent = typeof intents.$inferInsert;
