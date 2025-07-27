import { eq } from "drizzle-orm";
import { db } from "../db";
import { type Intent, intents } from "../db/schema";
import { findActiveIntent } from "./findActiveIntent";

export async function start({
  message,
  branchId,
}: {
  message: string;
  branchId: string;
}): Promise<Intent> {
  try {
    const activeIntent = await findActiveIntent({ branchId });

    return db.transaction((tx) => {
      if (activeIntent) {
        db.update(intents)
          .set({
            status: "cancelled",
          })
          .where(eq(intents.id, activeIntent.id))
          .run();
      }

      return tx
        .insert(intents)
        .values({
          message,
          status: "active",
          branchId,
        })
        .returning()
        .get();
    });
  } catch (error) {
    console.error("Failed to add new intent: ", error);
    throw new Error(
      `Failed to create intent: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
