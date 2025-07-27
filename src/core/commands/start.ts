import { eq } from "drizzle-orm";
import { db } from "../db";
import { intents } from "../db/schema";
import { findActiveIntent } from "./findActiveIntent";

export async function start({
  message,
  branchId,
}: {
  message: string;
  branchId: string;
}) {
  const activeIntent = await findActiveIntent({ branchId });

  if (activeIntent) {
    db.update(intents)
      .set({
        status: "completed",
      })
      .where(eq(intents.id, activeIntent.id))
      .run();
  }

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
