import * as fs from "fs";
import * as path from "path";
import { logger } from "./logger";

// Directories/files to always skip
const IGNORE_DIRS = new Set([
  "node_modules", ".next", ".git", ".vercel", "dist", "build", ".turbo",
]);
const IGNORE_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff", ".woff2",
  ".ttf", ".eot", ".mp4", ".webm", ".mp3", ".wav", ".zip", ".tar",
  ".gz", ".lock", ".map",
]);
const MAX_FILE_SIZE = 100 * 1024; // 100 KB — skip huge files

interface FileEntry {
  relativePath: string;
  content: string;
  tokens: string[]; // lowercased word tokens for matching
}

let fileIndex: FileEntry[] = [];
let lastIndexTime = 0;
const INDEX_TTL = 30_000; // re-index every 30 seconds max

/**
 * Recursively scan the project directory and build an in-memory index.
 */
export function indexProject(rootDir: string): void {
  fileIndex = [];
  logger.log(`📂 Indexing project: ${rootDir}`);
  walkDir(rootDir, rootDir);
  lastIndexTime = Date.now();
  logger.log(`✅ Indexed ${fileIndex.length} files.`);
}

function walkDir(dir: string, rootDir: string): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (entry.name.startsWith(".") && entry.name !== ".env.example") continue;
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) {
        walkDir(fullPath, rootDir);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (IGNORE_EXTENSIONS.has(ext)) continue;

      try {
        const stat = fs.statSync(fullPath);
        if (stat.size > MAX_FILE_SIZE) continue;

        const content = fs.readFileSync(fullPath, "utf-8");
        const relativePath = path.relative(rootDir, fullPath).replace(/\\/g, "/");
        const tokens = tokenize(relativePath + " " + content);

        fileIndex.push({ relativePath, content, tokens });
      } catch {
        // Skip files we can't read
      }
    }
  }
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1);
}

/**
 * Retrieve the top-K most relevant files for a given query.
 * Uses simple keyword overlap scoring.
 */
export function getRelevantFiles(
  rootDir: string,
  query: string,
  topK: number = 10
): { relativePath: string; content: string }[] {
  // Re-index if stale
  if (Date.now() - lastIndexTime > INDEX_TTL || fileIndex.length === 0) {
    indexProject(rootDir);
  }

  const queryTokens = new Set(tokenize(query));
  const queryLower = query.toLowerCase();
  const isUITask = queryLower.includes("ui") || queryLower.includes("style") || queryLower.includes("css") || queryLower.includes("theme") || queryLower.includes("layout") || queryLower.includes("format");

  if (queryTokens.size === 0) {
    return fileIndex.slice(0, topK).map((f) => ({
      relativePath: f.relativePath,
      content: f.content,
    }));
  }

  const scored = fileIndex.map((file) => {
    let score = 0;
    const pathLower = file.relativePath.toLowerCase();
    
    for (const token of queryTokens) {
      if (file.tokens.includes(token)) score++;
      
      // Path Boosting: If query token appears in file path, give it a HUGE boost
      if (pathLower.includes(token)) score += 5;
    }

    // Infrastructural Boosting
    // Core files that define the theme/layout should almost always be visible in UI tasks
    const isCoreInfra = 
      pathLower.endsWith("globals.css") || 
      pathLower.includes("tailwind.config") || 
      pathLower.includes("package.json") ||
      pathLower.includes("layout.tsx") ||
      pathLower.includes("layout.jsx") ||
      pathLower.includes("theme.ts") ||
      pathLower.includes("header") || 
      pathLower.includes("navbar");

    if (isCoreInfra && isUITask) {
      score += 10; // Massive boost for foundational files in UI tasks
    }

    return { ...file, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const results = scored.slice(0, topK);
  
  if (results.length > 0 && results[0].score > 0) {
    logger.log(`🎯 Top RAG match: ${results[0].relativePath} (score: ${results[0].score})`);
  }

  return results.map((f) => ({
    relativePath: f.relativePath,
    content: f.content,
  }));
}

/**
 * List all indexed file paths.
 */
export function listFiles(rootDir: string): string[] {
  if (Date.now() - lastIndexTime > INDEX_TTL || fileIndex.length === 0) {
    indexProject(rootDir);
  }
  return fileIndex.map((f) => f.relativePath);
}

/**
 * Read a single file's content by relative path.
 */
export function readFile(rootDir: string, relativePath: string): string | null {
  logger.log(`📖 Reading file: ${relativePath}`);
  const fullPath = path.join(rootDir, relativePath);
  try {
    return fs.readFileSync(fullPath, "utf-8");
  } catch {
    return null;
  }
}

/**
 * Returns a hierarchical string representing the project file structure.
 */
export function getProjectStructure(rootDir: string): string {
  logger.log("🌿 Generating project structure string...");
  if (fileIndex.length === 0) {
    indexProject(rootDir);
  }
  
  const paths = fileIndex.map(f => f.relativePath).sort();
  let structure = "";
  let lastParts: string[] = [];

  for (const p of paths) {
    const parts = p.split("/");
    let indent = "";
    for (let i = 0; i < parts.length; i++) {
        if (parts[i] !== lastParts[i]) {
            structure += "  ".repeat(i) + " - " + parts[i] + "\n";
        }
    }
    lastParts = parts;
  }
  return structure;
}
