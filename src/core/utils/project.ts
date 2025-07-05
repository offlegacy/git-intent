import { eq } from "drizzle-orm";
import { db } from "../db";
import { projects } from "../db/schema";
import { getProjectMetadata } from "./git";

export function ensureProject() {
  const projectMeta = getProjectMetadata();

  const existingProject = db
    .select()
    .from(projects)
    .where(eq(projects.id, projectMeta.id))
    .get();

  if (existingProject) {
    return existingProject.id;
  }

  db.insert(projects)
    .values({
      id: projectMeta.id,
      repoPath: projectMeta.repoPath,
      repoName: projectMeta.repoName,
    })
    .run();

  return projectMeta.id;
}
