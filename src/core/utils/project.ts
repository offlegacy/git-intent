import { projects } from "../db/schema";
import { getGitService } from "../git/gitManager";
import { ensureEntity } from "./db-helpers";

export async function ensureProject() {
  const { getProjectMetadata } = getGitService();
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
