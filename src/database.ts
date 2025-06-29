import { Database } from "bun:sqlite";

import { SCHEMA } from "./schema";

const DB_PATH = process.env.DB_PATH || "intents.db";

export const initDb = () => {
  const db = new Database(DB_PATH);
  db.run(SCHEMA);
  return db;
};

export const db = initDb();
