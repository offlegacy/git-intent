import { drizzle } from "drizzle-orm/bun-sqlite";

declare global {
  var __db: ReturnType<typeof drizzle> | undefined;
}

export const IntentStatus = [
  "created",
  "in_progress",
  "completed",
  "cancelled",
] as const;
