import { NextRequest, NextResponse } from "next/server";
import * as path from "path";
import { listFiles, readFile } from "@/agent/rag";
import { logger } from "@/agent/logger";

const PROJECT_ROOT = path.resolve(process.cwd());

/**
 * GET /api/agent/files         → list all project files
 * GET /api/agent/files?path=…  → read a specific file
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("path");

    if (filePath) {
      logger.log(`📥 Read File Request: ${filePath}`);
      // Read a specific file
      const content = readFile(PROJECT_ROOT, filePath);
      if (content === null) {
        return NextResponse.json(
          { error: `File not found: ${filePath}` },
          { status: 404 }
        );
      }
      return NextResponse.json({ path: filePath, content });
    }

    logger.log("📥 List Files Request received.");
    // List all files
    const files = listFiles(PROJECT_ROOT);
    return NextResponse.json({ files });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Files error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
