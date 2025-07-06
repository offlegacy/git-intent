import { db } from "../db";
import { intents } from "../db/schema";

export function start({
  message,
  branchId,
}: {
  message: string;
  branchId: string;
}) {
  const result = db
    .insert(intents)
    .values({
      message,
      status: "active",
      branchId,
    })
    .run();

  return Number(result.lastInsertRowid);
}
