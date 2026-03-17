import { NextRequest, NextResponse } from "next/server";
import * as path from "path";
import * as fs from "fs";
import { getRelevantFiles } from "@/agent/rag";
import { askGemini } from "@/agent/gemini";
import { logger } from "@/agent/logger";

// Project root — two levels up from app/api/agent/chat/
const PROJECT_ROOT = path.resolve(process.cwd());

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;
    logger.log("📨 Agent Chat Request:", { message });

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Missing 'message' in request body" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your-gemini-api-key-here") {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured. Add it to .env.local" },
        { status: 500 }
      );
    }

    // 1. Use RAG to find relevant files
    logger.log("🔍 Searching for relevant files...");
    const relevantFiles = getRelevantFiles(PROJECT_ROOT, message, 5);
    logger.log(`✅ Found ${relevantFiles.length} relevant files:`, relevantFiles.map(f => f.relativePath));

    // 2. Build file context string
    const fileContext = relevantFiles
      .map(
        (f) =>
          `--- FILE: ${f.relativePath} ---\n${f.content}\n--- END FILE ---`
      )
      .join("\n\n");

    // 3. Ask Gemini
    logger.log("🤖 Querying Gemini...");
    const response = await askGemini(fileContext, message);
    logger.log("✨ Gemini Response received.");

    // 4. Apply file edits if any
    const filesChanged: string[] = [];
    if (response.edits.length > 0) {
      logger.log(`🛠 Applying ${response.edits.length} file edits...`);
    }

    for (const edit of response.edits) {
      const targetPath = path.join(PROJECT_ROOT, edit.filePath);

      // Safety: prevent writing outside project
      if (!targetPath.startsWith(PROJECT_ROOT)) continue;
      // Safety: prevent touching dangerous directories
      if (
        edit.filePath.startsWith("node_modules") ||
        edit.filePath.startsWith(".git/") ||
        edit.filePath.startsWith(".next/") ||
        edit.filePath.startsWith(".env")
      )
        continue;

      if (edit.action === "delete") {
        if (fs.existsSync(targetPath)) {
          fs.unlinkSync(targetPath);
          filesChanged.push(`deleted: ${edit.filePath}`);
        }
      } else {
        // create or modify
        const dir = path.dirname(targetPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(targetPath, edit.content, "utf-8");
        const actionLabel = edit.action === "create" ? "created" : "modified";
        logger.log(`💾 File ${actionLabel}: ${edit.filePath}`);
        filesChanged.push(
          `${actionLabel}: ${edit.filePath}`
        );
      }
    }

    return NextResponse.json({
      reply: response.reply,
      filesChanged,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error("Agent chat error:", errorMessage);
    return NextResponse.json(
      { error: `Agent error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
