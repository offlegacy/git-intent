import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";

const DB_PATH = process.env.DB_PATH || "intents.db";

const createDatabaseConnection = () => {
  const sqlite = new Database(DB_PATH);
  return drizzle(sqlite);
};

// Ensure singleton on globalThis
if (!globalThis.__db) {
  globalThis.__db = createDatabaseConnection();
}

export const db = globalThis.__db;
