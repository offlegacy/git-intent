import { branches } from "../db/schema";
import { createGitService } from "../git/gitManager";
import { ensureEntity } from "./db-helpers";

export async function ensureBranch(projectId: string) {
  const { getBranchMetadata } = createGitService();
  const branchMeta = await getBranchMetadata(projectId);

  return ensureEntity({
    table: branches,
    data: {
      id: branchMeta.id,
      projectId,
      name: branchMeta.name,
    },
  });
}
