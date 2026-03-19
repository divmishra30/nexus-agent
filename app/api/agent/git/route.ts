import { NextRequest, NextResponse } from "next/server";
import * as path from "path";
import { getStatus } from "@/agent/git_ops";
import { logger } from "@/agent/logger";

const PROJECT_ROOT = path.resolve(process.cwd());

/**
 * GET /api/agent/git → get current git status
 */
export async function GET() {
  try {
    logger.log("📥 Git Status Request received.");
    const status = await getStatus(PROJECT_ROOT);
    return NextResponse.json(status);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Git error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
