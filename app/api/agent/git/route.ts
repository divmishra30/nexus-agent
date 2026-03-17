import { NextRequest, NextResponse } from "next/server";
import * as path from "path";
import { commitAndPush, getStatus } from "@/agent/git_ops";
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

/**
 * POST /api/agent/git → commit & push changes
 * Body: { message: string, branch?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, branch } = body;
    logger.log("📥 Git Push Request:", { message, branch });

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Missing 'message' in request body" },
        { status: 400 }
      );
    }

    const result = await commitAndPush(PROJECT_ROOT, message, branch);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Git error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
