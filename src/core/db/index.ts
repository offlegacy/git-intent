import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import * as schema from "./schema";

export const DB_PATH = path.resolve(process.cwd(), "intents.db");

const sqlite = new Database(DB_PATH);

export const db = drizzle(sqlite, {
  schema,
  logger: process.env.NODE_ENV === "development",
});

migrate(db, { migrationsFolder: "./drizzle" });
