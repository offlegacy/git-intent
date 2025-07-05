import type { drizzle } from "drizzle-orm/better-sqlite3";

declare global {
  var __db: ReturnType<typeof drizzle> | undefined;
}

export const INTENT_STATUS = [
  "created",
  "in_progress",
  "completed",
  "cancelled",
] as const;
