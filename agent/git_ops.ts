import simpleGit, { SimpleGit } from "simple-git";
import { logger } from "./logger";

/**
 * Get a SimpleGit instance for the given repo directory.
 */
function getGit(repoDir: string): SimpleGit {
  return simpleGit(repoDir);
}

/**
 * Get the current git status: branch name + changed files.
 */
export async function getStatus(repoDir: string) {
  logger.log("📜 Fetching Git status...");
  const git = getGit(repoDir);
  const status = await git.status();
  logger.log(`✅ Git status: ${status.isClean() ? "Clean" : "Dirty"} (${status.current})`);
  return {
    branch: status.current || "unknown",
    changed: [
      ...status.modified,
      ...status.not_added,
      ...status.created,
      ...status.deleted,
    ],
    isClean: status.isClean(),
  };
}

