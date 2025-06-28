import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

import { IntentStatus } from "./types";

export const intentsTable = sqliteTable("intents", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  message: text("message").notNull(),
  status: text({ enum: IntentStatus }),
  timestamp: text().default(sql`(CURRENT_TIMESTAMP)`),
});
