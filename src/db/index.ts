import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { DB_PATH } from "./path";
import * as schema from "./schema";

const sqlite = new Database(DB_PATH);

export const db = drizzle(sqlite, {
  schema,
  logger: process.env.NODE_ENV === "development",
});
