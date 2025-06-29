import path from "node:path";

/**
 * Absolute path to SQLite database file.
 *
 * Priority:
 *   1. `DB_PATH` environment variable
 *   2. Project default: `src/db/intents.db`
 */
export const DB_PATH: string = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.resolve("src/db/intents.db");
