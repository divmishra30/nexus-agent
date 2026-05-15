import { exec } from "child_process";
import { promisify } from "util";
import { logger } from "./logger";

const execAsync = promisify(exec);

/**
 * Run the production build.
 */
export async function runBuild() {
  logger.log("🏗️ Starting production build (npm run build)...");
  try {
    // Use env option for cross-platform compatibility (especially Windows)
    const { stdout, stderr } = await execAsync("npm run build", {
      env: { ...process.env, NEXT_PRIVATE_SKIP_FETCH_CACHE: "1" }
    });
    if (stderr && !stderr.includes("warning")) {
      logger.warn(`⚠️ Build output contains stderr: ${stderr}`);
    }
    logger.log("✅ Build completed successfully.");
    return { success: true, output: stdout };
  } catch (err: any) {
    logger.error("❌ Build failed:", err.message);
    return { success: false, error: err.message, output: err.stdout };
  }
}

/**
 * Reload the server using PM2.
 */
export async function reloadServer(appName: string = "all") {
  logger.log(`🔄 Reloading PM2 processes: ${appName}...`);
  try {
    const { stdout } = await execAsync(`pm2 reload ${appName}`);
    logger.log(`✅ PM2 ${appName} reloaded.`);
    return { success: true, output: stdout };
  } catch (err: any) {
    logger.error(`❌ Failed to reload server ${appName}:`, err.message);
    return { success: false, error: err.message };
  }
}
