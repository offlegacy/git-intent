import { eq } from "drizzle-orm";
import { db } from "../db";
import { branches } from "../db/schema";
import { getBranchMetadata } from "./git";

export function ensureBranch(projectId: string) {
  const branchMeta = getBranchMetadata();

  const existingBranch = db
    .select()
    .from(branches)
    .where(eq(branches.id, branchMeta.id))
    .get();

  if (existingBranch) {
    return existingBranch.id;
  }

  db.insert(branches)
    .values({
      id: branchMeta.id,
      projectId: projectId,
      name: branchMeta.name,
    })
    .run();

  return branchMeta.id;
}
