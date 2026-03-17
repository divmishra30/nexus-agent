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
 * Stage all changes, commit, and push to the remote.
 */
export async function commitAndPush(
  repoDir: string,
  message: string,
  branch?: string
): Promise<{ success: boolean; commitHash?: string; error?: string }> {
  try {
    logger.log(`🚀 Committing & Pushing: "${message}"${branch ? ` to ${branch}` : ""}`);
    const git = getGit(repoDir);

    // Stage all changes
    logger.log("  - Staging changes...");
    await git.add(".");

    // Commit
    logger.log("  - Committing...");
    const commitResult = await git.commit(message);
    const commitHash =
      commitResult.commit || (commitResult as unknown as { sha?: string }).sha || "unknown";

    // Push to the specified branch or the current one
    if (branch) {
      console.log(`  - Pushing to origin/${branch}...`);
      await git.push("origin", branch);
    } else {
      logger.log("  - Pushing to current branch...");
      await git.push();
    }
    logger.log(`✅ Push successful. Commit: ${commitHash}`);

    return { success: true, commitHash: String(commitHash) };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return { success: false, error: errorMessage };
  }
}
