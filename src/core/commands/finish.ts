import { eq } from "drizzle-orm";
import { db } from "../db";
import { type Intent, intents } from "../db/schema";
import { findActiveIntent } from "./findActiveIntent";

export async function finish({
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
        status: "completed",
      })
      .where(eq(intents.id, activeIntent.id))
      .returning()
      .get();
  } catch (error) {
    console.error("Failed to finish intent: ", error);
    throw new Error(
      `Failed to finish intent: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
