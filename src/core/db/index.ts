import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import * as schema from "./schema";

export const DB_PATH = path.resolve(process.cwd(), "intents.db");

const initializeDatabase = () => {
  const dbExists = fs.existsSync(DB_PATH);
  const sqlite = new Database(DB_PATH);

  const db = drizzle(sqlite, {
    schema,
    logger: process.env.NODE_ENV === "development",
  });

  if (!dbExists) {
    try {
      migrate(db, { migrationsFolder: "./drizzle" });
    } catch (error) {
      console.error("Migration failed:", error);
      throw error;
    }
  }

  return db;
};

export const db = initializeDatabase();
