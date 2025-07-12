import { projects } from "../db/schema";
import { createGitService } from "../git/gitManager";
import { ensureEntity } from "./db-helpers";

export async function ensureProject() {
  const { getProjectMetadata } = createGitService();
  const projectMeta = await getProjectMetadata();

  return ensureEntity({
    table: projects,
    data: {
      id: projectMeta.id,
      repoPath: projectMeta.repoPath,
      repoName: projectMeta.repoName,
    },
  });
}
