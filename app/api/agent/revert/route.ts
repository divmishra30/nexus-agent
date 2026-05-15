import { NextRequest, NextResponse } from "next/server";
import * as path from "path";
import { gitResetHard } from "../../../../agent/git_ops";
import { logger } from "../../../../agent/logger";

const PROJECT_ROOT = path.resolve(process.cwd());

export async function POST(request: NextRequest) {
  try {
    logger.log("⏪ Revert Request Received");
    await gitResetHard(PROJECT_ROOT);
    
    return NextResponse.json({
      success: true,
      message: "Successfully reverted all local changes to the last commit."
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error("Revert error:", errorMessage);
    return NextResponse.json(
      { error: `Revert failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
