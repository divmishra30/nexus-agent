import * as fs from "fs";
import * as path from "path";
import { logger } from "./logger";

// Directories/files to always skip
const IGNORE_DIRS = new Set([
  "node_modules", ".next", ".git", ".vercel", "dist", "build", ".turbo", "agent"
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

interface NexusConfig {
  project?: {
    structure?: Record<string, string>;
    design?: {
      styles?: string;
      preferences?: string[];
    };
  };
}

let fileIndex: FileEntry[] = [];
let lastIndexTime = 0;
let cachedConfig: NexusConfig | null = null;
const INDEX_TTL = 30_000; // re-index every 30 seconds max

/**
 * Loads the nexus.json configuration if it exists.
 */
function loadNexusConfig(rootDir: string): NexusConfig | null {
  const configPath = path.join(rootDir, "nexus.json");
  if (fs.existsSync(configPath)) {
    try {
      const content = fs.readFileSync(configPath, "utf-8");
      return JSON.parse(content);
    } catch (e) {
      logger.error("Failed to parse nexus.json", e);
    }
  }
  return null;
}

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
    cachedConfig = loadNexusConfig(rootDir);
  }

  const queryTokens = new Set(tokenize(query));
  const queryLower = query.toLowerCase();
  const isUITask = queryLower.includes("ui") || queryLower.includes("style") || queryLower.includes("css") || queryLower.includes("theme") || queryLower.includes("layout") || queryLower.includes("format") || queryLower.includes("look") || queryLower.includes("premium");

  if (queryTokens.size === 0) {
    return fileIndex.slice(0, topK).map((f) => ({
      relativePath: f.relativePath,
      content: f.content,
    }));
  }

  // First pass: Calculate base scores
  const baseScored = fileIndex.map((file) => {
    let score = 0;
    const pathLower = file.relativePath.toLowerCase();
    
    for (const token of queryTokens) {
      if (file.tokens.includes(token)) score++;
      
      // Path Boosting: If query token appears in file path, give it a HUGE boost
      if (pathLower.includes(token)) score += 5;
    }

    // Infrastructural Boosting
    // Build a list of core files from both defaults and nexus.json
    const coreFiles = new Set([
      "globals.css", "tailwind.config", "package.json", "layout.tsx", "layout.jsx", "theme.ts", "next.config"
    ]);

    if (cachedConfig?.project?.structure) {
      Object.values(cachedConfig.project.structure).forEach(p => coreFiles.add(p.toLowerCase()));
    }

    const isCoreInfra = Array.from(coreFiles).some(cf => pathLower.includes(cf));

    if (isCoreInfra && isUITask) {
      score += 8; 
    }

    // Design preference boosting
    if (cachedConfig?.project?.design?.preferences && isUITask) {
      for (const pref of cachedConfig.project.design.preferences) {
        if (queryLower.includes(pref.toLowerCase())) score += 3;
      }
    }

    return { ...file, score };
  });

  // Second pass: Structural & Linked Boosting
  // If a file has a high score, boost its neighbors and sibling files (e.g. Header.tsx -> Header.css)
  const finalScored = baseScored.map((file) => {
    let extraScore = 0;
    const currentDir = path.dirname(file.relativePath);
    const currentBase = path.basename(file.relativePath, path.extname(file.relativePath));

    for (const other of baseScored) {
      if (other.score > 10 && other.relativePath !== file.relativePath) {
        const otherDir = path.dirname(other.relativePath);
        const otherBase = path.basename(other.relativePath, path.extname(other.relativePath));

        // Boosting siblings (same base name, different extension)
        if (currentBase === otherBase && currentDir === otherDir) {
          extraScore += other.score * 0.5;
        }

        // Boosting neighbors (same directory)
        if (currentDir === otherDir) {
          extraScore += 2;
        }
      }
    }

    return { ...file, score: file.score + extraScore };
  });

  finalScored.sort((a, b) => b.score - a.score);
  const results = finalScored.slice(0, topK);
  
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
