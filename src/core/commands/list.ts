import { desc, eq } from "drizzle-orm";
import type { IntentStatus } from "../../types";
import { db } from "../db";
import type { Intent } from "../db/schema";
import { intents } from "../db/schema";

export function list(status?: (typeof IntentStatus)[number]): Intent[] {
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
