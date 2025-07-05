import type { IntentStatus } from "../constants";
import { db } from "../db";
import { intents } from "../db/schema";

export function add(message: string, status: IntentStatus = "created"): number {
  const result = db.insert(intents).values({ message, status }).run();
  return Number(result.lastInsertRowid);
}
