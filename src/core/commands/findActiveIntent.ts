import { db } from "../db";

export async function findActiveIntent({ branchId }: { branchId: string }) {
  return db.query.intents.findFirst({
    where: (intents, { eq, and }) =>
      and(eq(intents.branchId, branchId), eq(intents.status, "active")),
  });
}
