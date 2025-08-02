import { eq } from "drizzle-orm";
import { db } from "../db";
import { type Intent, intents } from "../db/schema";
import { findActiveIntent } from "./findActiveIntent";

export async function cancel({
  branchId,
}: {
  branchId: string;
}): Promise<Intent> {
  try {
    const activeIntent = await findActiveIntent({ branchId });

    if (!activeIntent) {
      throw new Error("No active intent found for this branch");
    }

    return db
      .update(intents)
      .set({
        status: "cancelled",
      })
      .where(eq(intents.id, activeIntent.id))
      .returning()
      .get();
  } catch (error) {
    console.error("Failed to cancel intent: ", error);
    throw new Error(
      `Failed to cancel intent: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
