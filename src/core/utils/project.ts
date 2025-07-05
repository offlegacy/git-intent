import { projects } from "../db/schema";
import { ensureEntity } from "./db-helpers";
import { getProjectMetadata } from "./git";

export function ensureProject() {
  const projectMeta = getProjectMetadata();

  return ensureEntity({
    table: projects,
    data: {
      id: projectMeta.id,
      repoPath: projectMeta.repoPath,
      repoName: projectMeta.repoName,
    },
  });
}
