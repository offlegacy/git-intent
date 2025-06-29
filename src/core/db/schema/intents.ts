import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const intents = sqliteTable("intents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  message: text("message").notNull(),
  status: text("status").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
});

export type Intent = typeof intents.$inferSelect;
export type NewIntent = typeof intents.$inferInsert;
