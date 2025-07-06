import { eq } from "drizzle-orm";
import type { AnySQLiteTable, SQLiteColumn } from "drizzle-orm/sqlite-core";
import { db } from "../db";

/**
 * Creates a new entity if it doesn't exist, otherwise returns the existing entity's ID
 */
export function ensureEntity<T extends { id: string }>({
  table,
  data,
}: {
  table: AnySQLiteTable & { id: SQLiteColumn };
  data: T;
}): string {
  const existing = db.select().from(table).where(eq(table.id, data.id)).get();

  if (existing) {
    return existing.id;
  }

  db.insert(table).values(data).run();
  return data.id;
}
