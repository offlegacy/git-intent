import type { IntentStatus } from "../../types";
import { db } from "../db";
import { intents } from "../db/schema";

export function add(
  message: string,
  status: (typeof IntentStatus)[number] = "created",
): number {
  const result = db.insert(intents).values({ message, status }).run();
  return Number(result.lastInsertRowid);
}
