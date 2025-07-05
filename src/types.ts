import type { drizzle } from "drizzle-orm/better-sqlite3";

declare global {
  var __db: ReturnType<typeof drizzle> | undefined;
}
