import { branches } from "../db/schema";
import { ensureEntity } from "./db-helpers";
import { getBranchMetadata } from "./git";

export function ensureBranch(projectId: string) {
  const branchMeta = getBranchMetadata(projectId);

  return ensureEntity({
    table: branches,
    data: {
      id: branchMeta.id,
      projectId,
      name: branchMeta.name,
    },
  });
}
