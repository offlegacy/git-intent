import { db } from "../db";
import type { Intent } from "../db/schema";

export async function findActiveIntent({
  branchId,
}: {
  branchId: string;
}): Promise<Intent | undefined> {
  try {
    return await db.query.intents.findFirst({
      where: (intents, { eq, and }) =>
        and(eq(intents.branchId, branchId), eq(intents.status, "active")),
    });
  } catch (error) {
    console.error(error);
    throw new Error(
      `Failed to find active intent: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
