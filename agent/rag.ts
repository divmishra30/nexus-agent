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
  // Split on non-alphanumeric characters AND at boundaries of CamelCase/PascalCase
  return text
    .replace(/([a-z])([A-Z])/g, "$1 $2") // Split camelCase
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
  topK: number = 10,
  currentSelector: string | null = null,
  currentUrl: string | null = null,
  options: { includeRouteGroup?: boolean; recursiveDepth?: number } = {}
): { relativePath: string; content: string }[] {
  // Re-index if stale
  if (Date.now() - lastIndexTime > INDEX_TTL || fileIndex.length === 0) {
    indexProject(rootDir);
    cachedConfig = loadNexusConfig(rootDir);
  }

  const queryTokens = new Set(tokenize(query));
  const queryLower = query.toLowerCase();
  const uiKeywords = ["ui", "style", "css", "theme", "layout", "format", "look", "premium", "heading", "h1", "h2", "text", "element", "component", "remove", "add", "delete", "button", "link", "image", "icon", "nav", "footer", "header", "section"];
  const isUITask = uiKeywords.some(k => queryLower.includes(k));
  const isHomepageRequest = queryLower.includes("home") || queryLower.includes("homepage") || queryLower.includes("main page");

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
    const isDataFile = pathLower.endsWith(".json") || pathLower.includes("/data/");
    const isCodeFile = pathLower.endsWith(".tsx") || pathLower.endsWith(".ts") || pathLower.endsWith(".js") || pathLower.endsWith(".jsx");
    
    for (const token of queryTokens) {
      if (file.tokens.includes(token)) score++;
      
      // Path Boosting: If query token appears in file path, give it a HUGE boost
      if (pathLower.includes(token)) score += 5;
    }

    // --- STRATEGIC BOOSTING ---

    // 1. Homepage Boosting
    if (isHomepageRequest && (pathLower === "src/app/page.tsx" || pathLower === "app/page.tsx")) {
      score += 40;
    }

    // 2. UI Task Boosting
    if (isUITask) {
      if (isCodeFile) score += 5;
      if (pathLower.includes("page.tsx") || pathLower.includes("layout.tsx")) score += 10;
      if (isDataFile) score -= 15; // Heavily penalize data files for UI tasks
    }

    // 3. Infrastructural Boosting
    const coreFiles = new Set([
      "globals.css", "tailwind.config", "package.json", "layout.tsx", "layout.jsx", "theme.ts", "next.config"
    ]);

    if (cachedConfig?.project?.structure) {
      Object.values(cachedConfig.project.structure).forEach(p => coreFiles.add(p.toLowerCase()));
    }

    const isCoreInfra = Array.from(coreFiles).some(cf => pathLower.includes(cf));
    if (isCoreInfra && isUITask) {
      score += 10; 
    }

    // 4. Design preference boosting
    if (cachedConfig?.project?.design?.preferences && isUITask) {
      for (const pref of cachedConfig.project.design.preferences) {
        if (queryLower.includes(pref.toLowerCase())) score += 3;
      }
    }

    // 5. Route-Based Boosting (Next.js App Router focus)
    if (currentUrl) {
      const normalizedUrl = currentUrl.replace(/\/$/, "") || "/";
      const urlSegments = normalizedUrl.split("/").filter(Boolean);
      
      // Homepage
      if (normalizedUrl === "/" && (pathLower === "src/app/page.tsx" || pathLower === "app/page.tsx")) {
        score += 20;
      }
      
      // Segment matching
      // Route-Group Boosting (New: includes full subdirectories for the route)
      if (urlSegments.length > 0) {
        const routePath = urlSegments.join("/");
        // Exact route match
        if (pathLower.includes(`app/${routePath}`)) {
          score += 25; // Increased boost
          if (pathLower.endsWith("page.tsx") || pathLower.endsWith("layout.tsx")) score += 15;
        }
        
        // --- ROUTE-GROUP INCLUSION ---
        // If the file is inside the directory of the current route, give it a significant boost
        // This ensures all sibling components/styles are pulled in.
        if (options.includeRouteGroup && pathLower.includes(`/${urlSegments[urlSegments.length - 1]}/`)) {
          score += 10;
        }

        // Partial segment matching for dynamic routes
        for (const segment of urlSegments) {
          if (pathLower.includes(`app/${segment}`)) {
            score += 5;
          }
        }
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
  let results = finalScored.slice(0, topK);

  // --- SELECTOR-BASED FILE PINNING ---
  // If a currentSelector is provided, find the exact files containing it
  // and inject them at the front, overriding RAG scoring.
  if (currentSelector) {
    const pinnedPaths = findFilesBySelector(rootDir, currentSelector, currentUrl);
    if (pinnedPaths.length > 0) {
      logger.log(`📌 Pinned files from selector (${pinnedPaths.length}): ${pinnedPaths.join(", ")}`);
      
      const pinnedFiles = pinnedPaths
        .map(p => fileIndex.find(f => f.relativePath === p))
        .filter(Boolean) as FileEntry[];
      
      const pinnedSet = new Set(pinnedPaths);

      // --- COMPONENT AUTO-RESOLUTION ---
      // If the pinned files contain custom component tags (e.g. <MyComponent />),
      // resolve those component files and add them to context.
      const resolvedPaths = new Set<string>();
      for (const pinned of pinnedFiles) {
        const imports = extractImports(pinned.content);
        const componentTags = Array.from(pinned.content.matchAll(/<([A-Z][a-zA-Z0-9]+)/g)).map(m => m[1]);
        
        for (const tag of componentTags) {
          const importPath = imports[tag];
          if (importPath) {
            const resolved = resolveImportToPath(importPath, pinned.relativePath);
            if (resolved) resolvedPaths.add(resolved);
          }
        }
      }

      // Add resolved components to results if not already there
      for (const resPath of resolvedPaths) {
        if (!pinnedSet.has(resPath)) {
          const componentFile = fileIndex.find(f => f.relativePath === resPath);
          if (componentFile) {
            logger.log(`🔗 Auto-pinned child component: ${resPath}`);
            pinnedFiles.push(componentFile);
            pinnedSet.add(resPath);
          }
        }
      }

      // Re-filter RAG results to exclude newly added components
      const finalRagResults = results.filter(f => !pinnedSet.has(f.relativePath));

      // Pinned files go FIRST, then remaining RAG context fills slots
      results = [
        ...pinnedFiles.map(f => ({ ...f, score: 9999 })),
        ...finalRagResults.slice(0, topK - pinnedFiles.length)
      ];
    }
  }
  // ------------------------------------

  if (results.length > 0 && results[0].score > 0) {
    logger.log(`🎯 Top RAG match: ${results[0].relativePath} (score: ${results[0].score})`);
  }

  // --- RECURSIVE DEPENDENCY RESOLUTION (New) ---
  if (options.recursiveDepth && options.recursiveDepth > 0) {
    const seedFiles = results.map(r => r.relativePath);
    const expandedPaths = getRecursiveDependencies(seedFiles, options.recursiveDepth);
    
    // Add missing dependencies to results
    for (const depPath of expandedPaths) {
      if (!results.some(r => r.relativePath === depPath)) {
        const depFile = fileIndex.find(f => f.relativePath === depPath);
        if (depFile) {
          logger.log(`🔗 Recursively added dependency: ${depPath}`);
          results.push({ ...depFile, score: 50 }); // Give it a decent baseline score
        }
      }
    }
  }
  // ----------------------------------------------

  return results.map((f) => ({
    relativePath: f.relativePath,
    content: f.content,
  }));
}

/**
 * Recursively follows imports for a list of seed files.
 */
export function getRecursiveDependencies(seedPaths: string[], maxDepth: number = 3): Set<string> {
  const allDeps = new Set<string>(seedPaths);
  let currentBatch = new Set<string>(seedPaths);

  for (let depth = 0; depth < maxDepth; depth++) {
    const nextBatch = new Set<string>();
    for (const filePath of currentBatch) {
      const file = fileIndex.find(f => f.relativePath === filePath);
      if (!file) continue;

      const imports = extractImports(file.content);
      for (const importPath of Object.values(imports)) {
        const resolved = resolveImportToPath(importPath, filePath);
        if (resolved && !allDeps.has(resolved)) {
          allDeps.add(resolved);
          nextBatch.add(resolved);
        }
      }
    }
    if (nextBatch.size === 0) break;
    currentBatch = nextBatch;
  }
  return allDeps;
}

/**
 * Grep the file index for files that contain the CSS tokens from a selector.
 * Extracts class names, splits on special chars, and finds files with the highest
 * density of matching tokens. Returns file paths sorted by match count (desc).
 */
export function findFilesBySelector(rootDir: string, selector: string, currentUrl: string | null = null): string[] {
  if (fileIndex.length === 0) {
    indexProject(rootDir);
  }

  // 1. Extract the CSS class names from the selector string.
  //    Selector: "div.grid.grid-cols-1.md:grid-cols-2.lg:grid-cols-3.gap-5"
  //    Classes:  ["grid", "grid-cols-1", "md:grid-cols-2", "lg:grid-cols-3", "gap-5"]
  //
  //    We split on '.' but must preserve the 'prefix:class' format for responsive utilities.
  //    Strategy: split on '.', then reconstruct colon-containing tokens.
  const rawParts = selector.split('.').filter(p => p.trim().length > 0);

  // The first part may be the tag name (e.g., 'div') — strip it
  const tagNames = new Set(['div', 'span', 'section', 'ul', 'li', 'a', 'p', 'button', 'input', 'form', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'nav', 'header', 'footer', 'main', 'aside', 'article']);
  const classes = rawParts.filter(p => !tagNames.has(p.toLowerCase()) && !p.startsWith('#'));

  if (classes.length === 0) return [];

  // 2. Build CONSECUTIVE CLASS PAIRS for precise matching.
  //    e.g., ["grid grid-cols-1", "grid-cols-1 md:grid-cols-2", "md:grid-cols-2 lg:grid-cols-3", ...]
  //    These pairs are MUCH more unique than individual tokens.
  const classPairs: string[] = [];
  for (let i = 0; i < classes.length - 1; i++) {
    classPairs.push(`${classes[i]} ${classes[i + 1]}`);
  }

  // Also include the full class string as a search target (may appear in className=)
  // and triplets for extra precision
  const classTriplets: string[] = [];
  for (let i = 0; i < classes.length - 2; i++) {
    classTriplets.push(`${classes[i]} ${classes[i + 1]} ${classes[i + 2]}`);
  }

  // 3. Score each file:
  //    - Triplet match = 10 points (VERY specific — almost certainly the right file)
  //    - Pair match = 3 points (fairly specific)
  //    - Individual class match = 0.1 points (baseline, not decisive)
  const scored = fileIndex.map(file => {
    const content = file.content; // case-sensitive — Tailwind classes are lowercase
    let score = 0;

    for (const triplet of classTriplets) {
      if (content.includes(triplet)) score += 10;
    }
    for (const pair of classPairs) {
      if (content.includes(pair)) score += 3;
    }
    for (const cls of classes) {
      if (cls.length > 3 && content.includes(cls)) score += 0.1;
    }

    return { relativePath: file.relativePath, score };
  })
  .map(f => {
    // 3.5 URL-Aware Pinning Boost (New)
    // If the file path matches the current Next.js route, give it a massive boost
    // to break ties with other files containing the same CSS classes.
    let bonus = 0;
    if (currentUrl) {
      const pathLower = f.relativePath.toLowerCase();
      const normalizedUrl = currentUrl.replace(/\/$/, "") || "/";
      const urlSegments = normalizedUrl.split("/").filter(Boolean);

      // Homepage match
      if (normalizedUrl === "/" && (pathLower.includes("app/page.tsx") || pathLower.includes("components/home"))) {
        bonus += 50;
      }

      // Route segment match (e.g. /trustworthiness -> app/trustworthiness)
      if (urlSegments.length > 0) {
        const routePath = urlSegments.join("/");
        if (pathLower.includes(`app/${routePath}`)) {
          bonus += 50;
        }
        // Partial matches for components inside route folders
        for (const segment of urlSegments) {
          if (pathLower.includes(`/${segment}/`)) {
            bonus += 20;
          }
        }
      }
    }
    return { ...f, score: f.score + bonus };
  })
  .filter(f => f.score > 0)
  .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return [];

  logger.log(`🔎 Selector scan top match: ${scored[0].relativePath} (score: ${scored[0].score.toFixed(1)})`);

  // 4. Return files with a meaningful score
  //    STRICT PINNING: If the top match is > 2x better than the second match,
  //    only return the top match. This prevents "context bleed" from similar files.
  if (scored.length > 1 && scored[0].score > scored[1].score * 2) {
    logger.log(`🎯 Strict Pinning: Only returning top match ${scored[0].relativePath}`);
    return [scored[0].relativePath];
  }

  // Otherwise, return top 2
  return scored
    .filter(f => f.score >= 3)
    .slice(0, 2)
    .map(f => f.relativePath);
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

/**
 * Extract imports from a file content as a mapping of Name -> ImportPath.
 * e.g. { "ExportInlineEnquiry": "@/components/InlineBlComponent/ExportInlineEnquiry" }
 */
function extractImports(content: string): Record<string, string> {
  const imports: Record<string, string> = {};
  const importRegex = /import\s+(?:\{[^}]*\}|([A-Z][a-zA-Z0-9]*))\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    if (match[1] && match[2]) {
      imports[match[1]] = match[2];
    }
    // Also handle destructured imports if needed (more complex, but let's start with primary)
  }
  return imports;
}

/**
 * Resolves a Next.js/React import path to a relative file path in the project.
 */
function resolveImportToPath(importPath: string, currentFile: string): string | null {
  let resolved = importPath;
  
  // Handle Alias @/
  if (resolved.startsWith("@/")) {
    resolved = resolved.replace("@/", "");
  } else if (resolved.startsWith("./") || resolved.startsWith("../")) {
    const currentDir = path.dirname(currentFile);
    resolved = path.join(currentDir, resolved).replace(/\\/g, "/");
  }

  // Next.js allows importing without extension. Try common ones.
  const extensions = [".tsx", ".ts", ".js", ".jsx", "/page.tsx", "/index.tsx"];
  for (const ext of extensions) {
    const full = (resolved + ext).replace(/\/\//g, "/");
    if (fileIndex.some(f => f.relativePath === full)) return full;
  }
  
  // Check if it's already a full path in the index
  if (fileIndex.some(f => f.relativePath === resolved)) return resolved;

  return null;
}
