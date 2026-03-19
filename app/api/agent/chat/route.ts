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

    // 1. Multi-pass: Analyze intent first (Pure Prompt Refinement)
    const { analyzeIntent } = require("@/agent/gemini");
    const analysis = await analyzeIntent(message);

    if (analysis.isAmbiguous) {
      logger.log("⚠️ Intent analysis flagged as AMBIGUOUS, but proceeding with best-guess refinement.");
    }

    logger.log("✨ Intent analyzed. Refined prompt:", analysis.refinedPrompt);

    // 2. Get project structure
    logger.log("🔍 Fetching project structure...");
    const { getProjectStructure, indexProject } = require("@/agent/rag");
    const projectStructure = getProjectStructure(PROJECT_ROOT);

    // 3. Get RAG context using REFINED prompt
    logger.log("🔍 Fetching relevant files using refined prompt...");
    const relevantFiles = getRelevantFiles(PROJECT_ROOT, analysis.refinedPrompt, 10);
    logger.log(`✅ Found ${relevantFiles.length} relevant files.`);

    // 4. Build file context string
    const fileContext = relevantFiles
      .map(
        (f) =>
          `--- FILE: ${f.relativePath} ---\n${f.content}\n--- END FILE ---`
      )
      .join("\n\n");

    // 5. Ask Gemini for edits using REFINED prompt
    logger.log("🤖 Querying Gemini for edits with refined prompt...");
    const response = await askGemini(projectStructure, fileContext, analysis.refinedPrompt);
    logger.log(`✨ Gemini Response received. Reply length: ${response.reply.length}, Edits: ${response.edits.length}`);

    // 4. Apply file edits if any
    const filesChanged: string[] = [];
    if (response.edits.length > 0) {
      logger.log(`🛠 Applying ${response.edits.length} file edits...`);
      
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
          filesChanged.push(`${actionLabel}: ${edit.filePath}`);
        }
      }

      // Re-index project so changes are visible in the next turn
      logger.log("🔄 Re-indexing project after changes...");
      indexProject(PROJECT_ROOT);
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
