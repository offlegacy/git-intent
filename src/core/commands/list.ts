import { desc, eq } from "drizzle-orm";
import type { IntentStatus } from "../constants";
import { db } from "../db";
import type { Intent } from "../db/schema";
import { intents } from "../db/schema";

export function list(status?: IntentStatus): Intent[] {
  if (status) {
    return db
      .select()
      .from(intents)
      .where(eq(intents.status, status))
      .orderBy(desc(intents.id))
      .all();
  }

  return db.select().from(intents).orderBy(desc(intents.id)).all();
}
