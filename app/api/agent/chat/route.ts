import { NextRequest, NextResponse } from "next/server";
import * as path from "path";
import * as fs from "fs";
import { getRelevantFiles, getProjectStructure, indexProject, findFilesBySelector } from "../../../../agent/rag";
import { askGemini, analyzeIntent } from "../../../../agent/gemini";
import { logger } from "../../../../agent/logger";
import { validateCode } from "../../../../agent/validator";

// Project root — two levels up from app/api/agent/chat/
const PROJECT_ROOT = path.resolve(process.cwd());

/**
 * Extracts a code snippet (±15 lines) around the first occurrence of any selector token.
 * Returns a numbered snippet string or an empty string if nothing is found.
 */
function extractElementCodeSnippet(fileContent: string, selector: string, filePath: string): string {
  if (!fileContent || !selector) return "";

  const lines = fileContent.split("\n");
  // Extract meaningful class tokens from the selector
  const tokens = selector
    .split(/[.:#\s>+~[\]()]+/)
    .map(t => t.trim())
    .filter(t => t.length > 3 && !["div", "span", "section", "main", "article", "button", "input", "form", "header", "footer", "nav", "ul", "li", "a", "p", "img"].includes(t.toLowerCase()));

  if (tokens.length === 0) return "";

  // Find the line with the highest density of selector tokens
  let bestLine = -1;
  let bestScore = 0;
  for (let i = 0; i < lines.length; i++) {
    const lineLower = lines[i].toLowerCase();
    const score = tokens.filter(t => lineLower.includes(t.toLowerCase())).length;
    if (score > bestScore) {
      bestScore = score;
      bestLine = i;
    }
  }

  if (bestLine < 0 || bestScore === 0) return "";

  const start = Math.max(0, bestLine - 12);
  const end = Math.min(lines.length - 1, bestLine + 20);
  const snippet = lines
    .slice(start, end + 1)
    .map((line, idx) => `${start + idx + 1}: ${line}`)
    .join("\n");

  logger.log(`🔬 Extracted code snippet for ${filePath}: lines ${start + 1}–${end + 1} (best match at line ${bestLine + 1})`);
  return `File: ${filePath} (lines ${start + 1}–${end + 1})\n\`\`\`\n${snippet}\n\`\`\``;
}

/**
 * Apply a list of patch operations to a file's content.
 * Now supports fuzzy indentation matching to allow for AI miscounting leading spaces.
 */
export function applyPatches(
  content: string,
  patches: Array<{ find: string; replace: string }>,
  filePath: string
): { patchedContent: string; warnings: string[]; successCount: number; failureCount: number } {
  let patchedContent = content;
  const warnings: string[] = [];
  let successCount = 0;
  let failureCount = 0;

  for (const patch of patches) {
    if (!patch.find) continue;

    // 1. Try Exact Match
    if (patchedContent.includes(patch.find)) {
      patchedContent = patchedContent.replace(patch.find, patch.replace);
      logger.log(`✅ Patch applied (exact): ${filePath}`);
      successCount++;
    } 
    // 2. Try Fuzzy Match
    else {
      const fuzzyResult = attemptFuzzyPatch(patchedContent, patch.find, patch.replace);
      if (fuzzyResult.success) {
        patchedContent = fuzzyResult.content;
        logger.log(`✅ Patch applied (fuzzy): ${filePath}`);
        successCount++;
      } else {
        const warning = `Patch target not found in ${filePath}. 
Looked for: "${patch.find.substring(0, 100)}..."`;
        warnings.push(warning);
        logger.error(`⚠️ ${warning}`);
        failureCount++;
      }
    }
  }

  return { patchedContent, warnings, successCount, failureCount };
}

/**
 * Attempts to find a block of text ignoring leading whitespace on each line.
 * If found, replaces it while preserving the original indentation of the block.
 */
function attemptFuzzyPatch(source: string, find: string, replace: string): { success: boolean, content: string } {
  // Normalize function: ignore common character variations and indentation
  const normalize = (s: string) => s
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ") // Normalize all whitespace to single space
    .trim();

  const sourceLines = source.split("\n");
  const findTrimmed = normalize(find);
  
  if (findTrimmed.length === 0) return { success: false, content: source };

  // Moving window search
  // 2. Moving window search (Block-level equality)
  const findLines = find.split("\n").filter(l => l.trim().length > 0);
  for (let i = 0; i <= sourceLines.length - findLines.length; i++) {
    const block = sourceLines.slice(i, i + findLines.length).join("\n");
    if (normalize(block) === findTrimmed) {
      const originalIndent = sourceLines[i].match(/^\s*/)?.[0] || "";
      const replaceLines = replace.split("\n").map(line => originalIndent + line.trimStart());
      return { success: true, content: [...sourceLines.slice(0, i), ...replaceLines, ...sourceLines.slice(i + findLines.length)].join("\n") };
    }
  }

  // 3. Anchor-Based Matching (New: Handles '...' and minor deletions)
  if (findLines.length >= 2) {
    const headLine = normalize(findLines[0]);
    const tailLine = normalize(findLines[findLines.length - 1]);

    for (let i = 0; i < sourceLines.length; i++) {
        if (normalize(sourceLines[i]) === headLine) {
            // Find the tail line within 30 lines
            for (let j = i + 1; j < Math.min(i + 30, sourceLines.length); j++) {
                if (normalize(sourceLines[j]) === tailLine) {
                    logger.log(`🔗 Anchor Match Found: Lines ${i + 1} to ${j + 1}`);
                    const originalIndent = sourceLines[i].match(/^\s*/)?.[0] || "";
                    const replaceLines = replace.split("\n").map(line => originalIndent + line.trimStart());
                    return { success: true, content: [...sourceLines.slice(0, i), ...replaceLines, ...sourceLines.slice(j + 1)].join("\n") };
                }
            }
        }
    }
  }

  return { success: false, content: source };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, attachments, history, currentSelector, currentUrl } = body;
    logger.log("📨 Agent Chat Request:", { message, attachmentsCount: attachments?.length || 0, historyLength: history?.length || 0, currentSelector, currentUrl });

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
    const analysis = await analyzeIntent(message, history || [], attachments || [], currentSelector);

    if (analysis.isAmbiguous) {
      logger.log("⚠️ Intent analysis flagged as AMBIGUOUS, but proceeding with best-guess refinement.");
    }

    logger.log("✨ Intent analyzed. Refined prompt:", analysis.refinedPrompt);

    // 2. Get project structure
    logger.log("🔍 Fetching project structure...");
    const projectStructure = getProjectStructure(PROJECT_ROOT);

    // 3. Get RAG context using REFINED prompt + selector pinning + URL boosting
    logger.log("🔍 Fetching relevant files using refined prompt...");
    
    // Use advanced RAG options based on intent analysis
    const topK = analysis.isBigTask ? 40 : 12;
    const ragOptions = {
      includeRouteGroup: analysis.isBigTask,
      recursiveDepth: analysis.requiresRecursiveContext ? 3 : 0
    };

    const relevantFiles = getRelevantFiles(
      PROJECT_ROOT, 
      analysis.refinedPrompt, 
      topK, 
      currentSelector, 
      currentUrl,
      ragOptions
    );
    logger.log(`✅ Found ${relevantFiles.length} relevant files (Agentic RAG: bigTask=${analysis.isBigTask}, recursive=${analysis.requiresRecursiveContext}).`);

    // 4. Build file context string
    const fileContext = relevantFiles
      .map(
        (f) =>
          `--- FILE: ${f.relativePath} ---\n${f.content}\n--- END FILE ---`
      )
      .join("\n\n");

    // 5. Compute pinned files + element code snippets
    const pinnedFiles = currentSelector ? findFilesBySelector(PROJECT_ROOT, currentSelector, currentUrl) : [];
    if (pinnedFiles.length > 0) {
      logger.log(`📌 Pinned files to edit: ${pinnedFiles.join(", ")}`);
    }

    // Extract exact code snippets from ALL pinned files
    let elementCodeSnippet = "";
    if (pinnedFiles.length > 0 && currentSelector) {
      let snippets: string[] = [];
      for (const filePath of pinnedFiles) {
        let content = "";
        const fileInRag = relevantFiles.find(f => f.relativePath === filePath);
        
        if (fileInRag) {
          content = fileInRag.content;
        } else {
          const fullPath = path.join(PROJECT_ROOT, filePath);
          if (fs.existsSync(fullPath)) {
            content = fs.readFileSync(fullPath, "utf-8");
          }
        }

        if (content) {
          const snippet = extractElementCodeSnippet(content, currentSelector, filePath);
          if (snippet) {
            snippets.push(`### CODE SNIPPET FROM: ${filePath}\n${snippet}`);
          }
        }
      }
      elementCodeSnippet = snippets.join("\n\n---\n\n");
    }

    // 6. Ask Gemini for edits
    logger.log("🤖 Querying Gemini for edits with refined prompt...");
    let response = await askGemini(
      projectStructure,
      fileContext,
      analysis.refinedPrompt,
      attachments,
      history || [],
      currentSelector,
      pinnedFiles,
      elementCodeSnippet
    );
    logger.log(`✨ Gemini Response received. Reply length: ${response.reply.length}, Edits: ${response.edits.length}`);

    // 7. Apply file edits
    const filesChanged: string[] = [];
    const validationErrors: string[] = [];
    const retryEdits: Array<{ filePath: string; error: string }> = [];

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

        // --- PINNED FILE GUARD ---
        if (pinnedFiles.length > 0) {
          const isAllowed = pinnedFiles.some(
            pf => edit.filePath === pf || edit.filePath.replace(/\\/g, "/") === pf.replace(/\\/g, "/")
          );
          if (!isAllowed) {
            logger.error(`🛡️ BLOCKED edit to unpinned file: ${edit.filePath} (pinned: ${pinnedFiles.join(", ")})`);
            validationErrors.push(`Edit to "${edit.filePath}" was blocked — only pinned files matching the selected element may be modified.`);
            continue;
          }
        }
        // -------------------------

        if (edit.action === "delete") {
          if (fs.existsSync(targetPath)) {
            fs.unlinkSync(targetPath);
            filesChanged.push(`deleted: ${edit.filePath}`);
          }

        } else if (edit.action === "patch") {
          // --- PATCH APPLICATION ---
          if (!fs.existsSync(targetPath)) {
            logger.error(`🚫 Cannot patch non-existent file: ${edit.filePath}`);
            validationErrors.push(`Cannot patch non-existent file: ${edit.filePath}`);
            continue;
          }
          const patches = Array.isArray(edit.patches) ? edit.patches : [];
          if (patches.length === 0) {
            logger.error(`🚫 Patch action with no patches array for: ${edit.filePath}`);
            continue;
          }
          const currentContent = fs.readFileSync(targetPath, "utf-8");
          const { patchedContent, warnings, failureCount } = applyPatches(currentContent, patches, edit.filePath);

          if (warnings.length > 0) {
            validationErrors.push(...warnings);
            if (failureCount > 0) {
              retryEdits.push({ filePath: edit.filePath, error: `Critical: Patch 'find' target not found. Current File Content was different than expected. Try 'modify' action with full file content instead.` });
            }
          }

          if (failureCount === 0) {
            // Validate the patched result (syntax only)
            const validation = validateCode(edit.filePath, patchedContent);
            if (!validation.isValid) {
              const errorWithContext = `Syntax error: ${validation.error}. Please check for unclosed strings or mismatched brackets around the reported line.`;
              logger.error(`🚫 Patched file failed validation for ${edit.filePath}: ${errorWithContext}`);
              validationErrors.push(errorWithContext);
              retryEdits.push({ filePath: edit.filePath, error: errorWithContext });
              continue;
            }

            fs.writeFileSync(targetPath, patchedContent, "utf-8");
            logger.log(`💾 File patched: ${edit.filePath} (${patches.length} patch(es))`);
            filesChanged.push(`patched: ${edit.filePath}`);
          }
          // -------------------------

        } else {
          // Validate for syntax errors before writing
          const validation = validateCode(edit.filePath, edit.content);
          if (!validation.isValid) {
            const errorWithContext = `Syntax Error in your generated code: ${validation.error}. You likely forgot to close a string (' or ") or a curly brace {}.`;
            logger.error(`🚫 Generated 'modify' failed validation: ${errorWithContext}`);
            validationErrors.push(errorWithContext);
            retryEdits.push({ filePath: edit.filePath, error: errorWithContext });
            continue;
          }

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

      // --- AUTO-RETRY on validation errors ---
      if (retryEdits.length > 0) {
        logger.log(`🔁 Auto-retry: ${retryEdits.length} edit(s) failed validation. Retrying...`);
        const retryErrors = retryEdits
          .map(r => `File: ${r.filePath}\nError: ${r.error}`)
          .join("\n\n");

        const retryMessage = `${analysis.refinedPrompt}

--- RETRY CONTEXT ---
⚠️ CRITICAL ERROR: Your previous response FAILED to apply because a surgical patch target was not found. 
This is often caused by using "..." placeholders or character mismatches.

FAILURE DETAILS:
${retryErrors}

INSTRUCTIONS FOR RETRY:
1. For any file that failed, you MUST now use the "modify" action (full file).
2. Do NOT use "patch" for the failed files again.
3. Keep other successful files unchanged.
--- END RETRY CONTEXT ---`;

        try {
          const retryResponse = await askGemini(
            projectStructure,
            fileContext,
            retryMessage,
            attachments,
            history || [],
            currentSelector,
            pinnedFiles,
            elementCodeSnippet
          );

          for (const edit of retryResponse.edits) {
            const targetPath = path.join(PROJECT_ROOT, edit.filePath);
            if (!targetPath.startsWith(PROJECT_ROOT)) continue;
            if (pinnedFiles.length > 0) {
              const isAllowed = pinnedFiles.some(
                pf => edit.filePath.replace(/\\/g, "/") === pf.replace(/\\/g, "/")
              );
              if (!isAllowed) continue;
            }

            if (edit.action === "patch") {
              const patches = Array.isArray(edit.patches) ? edit.patches : [];
              const currentContent = fs.existsSync(targetPath) ? fs.readFileSync(targetPath, "utf-8") : "";
              const { patchedContent } = applyPatches(currentContent, patches, edit.filePath);
              const validation = validateCode(edit.filePath, patchedContent);
              if (validation.isValid) {
                fs.writeFileSync(targetPath, patchedContent, "utf-8");
                filesChanged.push(`retry-patched: ${edit.filePath}`);
                logger.log(`🔁✅ Retry patch succeeded: ${edit.filePath}`);
              }
            } else if (edit.content) {
              const validation = validateCode(edit.filePath, edit.content);
              if (validation.isValid) {
                const dir = path.dirname(targetPath);
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                fs.writeFileSync(targetPath, edit.content, "utf-8");
                filesChanged.push(`retry-modified: ${edit.filePath}`);
                logger.log(`🔁✅ Retry modify succeeded: ${edit.filePath}`);
              }
            }
          }
        } catch (retryErr) {
          logger.error("🔁❌ Retry failed:", retryErr);
        }
      }
      // --------------------------------------

      // Re-index project so changes are visible in the next turn
      logger.log("🔄 Re-indexing project after changes...");
      indexProject(PROJECT_ROOT);
    }

    let finalReply = response.reply;
    if (validationErrors.length > 0) {
      const blocked = validationErrors.filter(e => e.includes("was blocked"));
      const errors = validationErrors.filter(e => !e.includes("was blocked"));
      if (errors.length > 0) {
        finalReply += "\n\n⚠️ **Some changes encountered issues (auto-retry attempted):**\n" + 
                      errors.map(e => `- ${e}`).join("\n");
      }
      if (blocked.length > 0) {
        finalReply += "\n\n🛡️ **These edits were blocked (wrong file for selected element):**\n" +
                      blocked.map(e => `- ${e}`).join("\n");
      }
    }

    return NextResponse.json({
      reply: finalReply,
      filesChanged,
      validationErrors: validationErrors.length > 0 ? validationErrors : undefined
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
