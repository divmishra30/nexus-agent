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

/**
 * Hard reset to the last commit to discard all uncommitted local changes.
 */
export async function gitResetHard(repoDir: string) {
  logger.log("⏪ Executing Git Hard Reset...");
  const git = getGit(repoDir);
  try {
    await git.reset(["--hard"]);
    await git.clean("f", ["-d"]); // Remove untracked files
    logger.log("✅ Git Hard Reset successful.");
    return true;
  } catch (err) {
    logger.error("❌ Git Hard Reset failed:", err);
    throw err;
  }
}
