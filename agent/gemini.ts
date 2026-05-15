import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import * as fs from "fs";
import * as path from "path";
import { logger } from "./logger";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `You are a senior full-stack developer AI assistant integrated into a Next.js application.
Your job is to make PRECISE, MINIMAL, CORRECT code changes that exactly fulfill the user's request — nothing more.

### DESIGN PHILOSOPHY:
- **Visual Excellence**: Use harmonious color palettes, subtle gradients, and modern typography (Inter, Roboto).
- **Interactive Depth**: Hover effects, smooth transitions, defined borders. DO NOT use glassmorphism or backdrop-blur.
- **Tailwind-First**: ALWAYS use inline Tailwind utility classes. DO NOT create custom CSS unless defining project-wide theme tokens.
- **Structural Integrity**: Follow the project's atomic component structure.

### EDIT FORMAT — CRITICAL RULES:

You have THREE edit action types. Choose the most appropriate:

**1. action: "patch"** — USE THIS for targeted changes to existing files (PREFERRED)
   - Provide an array of \`patches\` with \`find\` and \`replace\` strings.
   - The \`find\` string MUST be an exact substring present in the current file.
   - **Pro-Tip**: The system uses intelligent fuzzy-indentation matching. If you are off by a few spaces, the patch will still apply and the system will auto-correct to the file's original style.
   - Use enough surrounding context in \`find\` to uniquely identify the location (at least one full line).
   - Leave \`content\` as an empty string "".
   - Example:
     \`\`\`json
     {
       "filePath": "src/app/page.tsx",
       "action": "patch",
       "content": "",
       "patches": [
         { "find": "lg:grid-cols-3 gap-5", "replace": "lg:grid-cols-4 gap-4" }
       ]
     }
     \`\`\`

**2. action: "modify"** — USE THIS ONLY when structural changes require rewriting the majority of a file.
   - Provide the COMPLETE new file content in \`content\`.
   - NEVER truncate the file. If you cannot write the complete file, use "patch" instead.
   - Leave \`patches\` as an empty array [].

**3. action: "create"** — For new files that do not yet exist.
   - Provide the full new file content in \`content\`.

**4. action: "delete"** — To delete a file. Leave content and patches empty.

### SCOPE RULES — READ CAREFULLY:
- **Minimal Change Principle**: Only change what the user explicitly asked for. Do NOT add extra features, refactors, or "improvements" unless asked.
- **Single Responsibility**: Each edit in the \`edits\` array should address one clear change.
- If the change is less than ~15 lines, ALWAYS use "patch" not "modify".
- If the CURRENT ELEMENT CODE section is provided, make changes ONLY within that code region.
- NEVER modify a file that is not referenced in PINNED FILES (when pinned files are present).

### ADDITIONAL RULES:
- **Asset Guardrail**: NEVER assume images exist in public/ unless explicitly provided as attachments.
- **Dependency Guardrail**: Do NOT import packages not listed in AVAILABLE DEPENDENCIES.
- **Route-Aware Focus**: If the user is on a specific page (e.g. /search.php) and asks for logic changes on that page, PRIORITIZE editing the files in that specific route's folder. Ignore unrelated forms, banners, or global components unless absolutely necessary. Avoid pulling in dozens of recursive dependencies if they are simple UI skeletons or unrelated forms.
- **Component-Aware Choice**: If you receive both a wrapper file (e.g., page.tsx) and a child component file (e.g., Form.tsx), and the user asks to change 'internal contents', 'alignment', or 'logic', prioritize editing the child component's file. Do NOT just add utility classes to the wrapper if the change should naturally live inside the child.
- **No Truncation**: If using "modify", the full file content is mandatory. Every line. No "// ... rest of file".
- **Phased Implementation**: For complex tasks (e.g. creating a new page), break your response into clear logically-grouped edits. Provide the structure first, then the logic.
- **Reliability First — FULL FILE PROTOCOL**: If a file is under 1000 lines, ALWAYS use the "modify" action instead of "patch".
- **Strict Surgical Rule**: If using "patch", NEVER use "..." or any placeholder. You MUST provide the full, exact characters. If unsure, use "modify".
- **String Safety (CRITICAL)**: In React/TSX files, if a code block contains apostrophes (e.g. IndiaMART's) or complex HTML, you MUST wrap the string in backticks (Template Literals) to avoid unterminated string errors.
- **Brace & Quote Matching**: Before finalizing your JSON, mentally verify that every opened '{', '[', '(', "'", and '"' is correctly closed. Truncated code is NOT allowed.
- **Retry Strategy**: If a previous attempt had a syntax error, use the provided line/error information to fix the specific spot. ALWAYS use "modify" for the retry to guarantee a clean file.
- Respond with valid JSON matching the schema. Summarize WHAT changed and WHY in the "reply" field.`;

const RESPONSE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    reply: { type: SchemaType.STRING },
    edits: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          filePath: { type: SchemaType.STRING },
          action: {
            type: SchemaType.STRING,
            description: "One of: 'patch', 'modify', 'create', 'delete'"
          },
          content: {
            type: SchemaType.STRING,
            description: "Full file content for 'create'/'modify'. Empty string for 'patch'/'delete'."
          },
          patches: {
            type: SchemaType.ARRAY,
            description: "Array of find/replace pairs for 'patch' action. Empty array for other actions.",
            items: {
              type: SchemaType.OBJECT,
              properties: {
                find: {
                  type: SchemaType.STRING,
                  description: "Exact substring to find in the current file. Must be unique and include enough context."
                },
                replace: {
                  type: SchemaType.STRING,
                  description: "The replacement string."
                }
              },
              required: ["find", "replace"]
            }
          }
        },
        required: ["filePath", "action", "content", "patches"]
      }
    }
  },
  required: ["reply", "edits"]
};

const INTENT_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    refinedPrompt: { type: SchemaType.STRING, description: "A highly detailed and clarified version of the user's request for a code editor." },
    recommendedFiles: { 
      type: SchemaType.ARRAY, 
      items: { type: SchemaType.STRING },
      description: "Paths or keywords for files that are likely relevant to this request."
    },
    isAmbiguous: { type: SchemaType.BOOLEAN, description: "True if the request is too vague to act upon." },
    clarificationQuestion: { type: SchemaType.STRING, description: "If ambiguous, what question should we ask the user?" },
    isBigTask: { type: SchemaType.BOOLEAN, description: "True if the task involves creating multiple files, replicating a page, or a major refactor." },
    requiresRecursiveContext: { type: SchemaType.BOOLEAN, description: "True if the task depends on understanding a deep component tree or import chain." }
  },
  required: ["refinedPrompt", "recommendedFiles", "isAmbiguous", "isBigTask", "requiresRecursiveContext"]
};

export async function askGemini(
  projectStructure: string,
  fileContext: string,
  userMessage: string,
  attachments: Array<{ name: string; type: string; url: string }> = [],
  history: Array<{ role: string; text: string }> = [],
  currentSelector: string | null = null,
  pinnedFiles: string[] = [],
  elementCodeSnippet: string = ""
): Promise<{ reply: string; edits: Array<{ filePath: string; action: string; content: string; patches?: Array<{ find: string; replace: string }> }> }> {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-3-flash-preview", 
    generationConfig: { 
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA
    }
  });

  // 1. Get available dependencies from package.json for the prompt context
  let dependencies = "Unknown";
  try {
    const pkgPath = path.join(process.cwd(), "package.json");
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      dependencies = JSON.stringify({ ...pkg.dependencies, ...pkg.devDependencies }, null, 2);
    }
  } catch (e) {
    logger.error("Failed to read package.json for dependency context", e);
  }

  const prompt = `${SYSTEM_PROMPT}

--- PROJECT STRUCTURE ---
${projectStructure}
--- END PROJECT STRUCTURE ---

--- AVAILABLE DEPENDENCIES ---
${dependencies}
--- END AVAILABLE DEPENDENCIES ---

--- RELEVANT FILE CONTEXT ---
${fileContext}
--- END RELEVANT FILE CONTEXT ---

--- ATTACHMENTS (Images/Docs) ---
${attachments.length > 0 ? attachments.map(a => `- Name: ${a.name}, Type: ${a.type}`).join('\n') : "None provided."}
--- END ATTACHMENTS ---

--- CURRENT ELEMENT FOCUS ---
${currentSelector
  ? `The user has explicitly selected this element using the browser element picker: "${currentSelector}"

This selector was captured directly from the DOM. The file(s) containing this selector are listed in PINNED FILES below.`
  : "No specific element selected for this turn. Apply changes globally or infer from the message."}
--- END CURRENT ELEMENT FOCUS ---

--- CURRENT ELEMENT CODE ---
${elementCodeSnippet
  ? `The following focused code snippets from the pinned files show the exact location of your selected element. 
  
  ⚠️ GUIDANCE: If multiple snippets are provided (e.g., from a parent wrapper and a child component), choose the one that most logically contains the requested change. For 'centering contents' or 'internal logic', prefer editing the child component snippet.
  
  Make changes ONLY within these code regions using "patch" actions where possible:

${elementCodeSnippet}`
  : "No specific code snippets extracted."}
--- END CURRENT ELEMENT CODE ---

--- PINNED FILES (MANDATORY) ---
${pinnedFiles.length > 0
  ? `⚠️ CRITICAL CONSTRAINT: The element selector above was found in the following file(s). You MUST ONLY edit files from this list for this request. DO NOT modify any other file, even if you think it is relevant:
${pinnedFiles.map(f => `  - ${f}`).join('\n')}

For any change to these files, PREFER the "patch" action with a precise find/replace. Use "modify" only if the change is structural and touches more than 20 lines.`
  : "No files pinned. Use your best judgment from the RELEVANT FILE CONTEXT above."}
--- END PINNED FILES ---

USER REQUEST: ${userMessage}`;

  // 2. Prepare current content parts for multimodal support
  const parts: any[] = [{ text: prompt }];

  // 3. Add attachments if any
  if (attachments && attachments.length > 0) {
    logger.log(`📎 Processing ${attachments.length} attachments for Gemini...`);
    for (const attachment of attachments) {
      try {
        const filePath = path.join(process.cwd(), "public", "uploads", attachment.name);
        if (fs.existsSync(filePath)) {
          const buffer = fs.readFileSync(filePath);
          parts.push({
            inlineData: {
              data: buffer.toString("base64"),
              mimeType: attachment.type
            }
          });
          logger.log(`✅ Attached ${attachment.name} (${attachment.type})`);
        }
      } catch (err) {
        logger.error(`❌ Failed to attach file ${attachment.name}:`, err);
      }
    }
  }

  // 4. Start chat with history
  const chat = model.startChat({
    history: history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }))
  });

  logger.log("📤 Sending prompt to Gemini with Response Schema...");
  const result = await chat.sendMessage(parts);
  const text = result.response.text();
  logger.log("📥 Received response from Gemini.");

  try {
    const parsed = JSON.parse(text);
    logger.log(`✅ Parsed Gemini JSON. Edits: ${parsed.edits?.length || 0}`);
    return {
      reply: parsed.reply || "Done.",
      edits: Array.isArray(parsed.edits) ? parsed.edits : [],
    };
  } catch (err) {
    logger.log(`⚠️ Gemini response was not valid JSON even with Schema: ${err instanceof Error ? err.message : String(err)}`);
    logger.error("Raw response that failed parsing:", text);
    
    return {
      reply: text.length > 500 ? "I encountered an error processing your request. Please try again with more detail." : text,
      edits: [],
    };
  }
}

export async function analyzeIntent(
  userMessage: string,
  history: Array<{ role: string; text: string }> = [],
  attachments: Array<{ name: string; type: string; url: string }> = [],
  currentSelector: string | null = null
): Promise<{ 
  refinedPrompt: string; 
  recommendedFiles: string[]; 
  isAmbiguous: boolean; 
  clarificationQuestion?: string;
  isBigTask: boolean;
  requiresRecursiveContext: boolean;
}> {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-3-flash-preview",
    generationConfig: { 
      responseMimeType: "application/json",
      responseSchema: INTENT_SCHEMA
    }
  });

  const historyContext = history.length > 0 
    ? `\n\n--- RECENT CONVERSATION HISTORY ---\n${history.map(h => `${h.role.toUpperCase()}: ${h.text}`).join('\n')}\n--- END HISTORY ---\n\n`
    : "";

  const prompt = `You are a Senior Software Architect and UX Strategist.
Your job is to translate raw user requests into RIGOROUS technical specifications for a code-editing LLM.

### YOUR GOAL:
1. **STRUCTURAL DECOMPOSITION**: If the user asks for a feature, identify all affected layers (UI, State, API, Styles).
2. **UX ENHANCEMENT**: If the user asks for "premium" or "better" design, infer specific technical requirements:
   - "Glassmorphism" for sidebars/headers.
   - "HSL tailored colors" for consistent branding.
   - "Micro-animations" for interaction.
3. **CONTEXT SEARCH**: Recommend files based on both content AND structure (e.g. if editing a page, recommend its layout and globals.css).
4. **PHASED PLANNING**: Refine the prompt to include a step-by-step implementation plan.
5. **CONTEXTUAL PRECISION**:
   - **Selector Override**: If a 'CURRENT SELECTOR' is provided, TRUMP any previous element context from history. Focus EXCLUSIVELY on this new element for element-specific requests.
   - **Context Decay**: If NO 'CURRENT SELECTOR' is provided, do NOT assume the user is still talking about a previously selected element unless they use explicit pronouns (e.g. "it", "that button"). If the request is a general UI change (e.g. "change background to blue"), apply it to the logical container (like the page or a section) rather than the last focused small component.
   - **Pronoun Resolution**: Only use history to resolve "it", "this", "that" if they clearly refer to a recent action or element.
6. **COMPLEXITY DETECTION**:
   - Set **isBigTask** to true if the user asks for a new feature, a page replica, or a "repo-wide" change.
   - Set **requiresRecursiveContext** to true if the request involves components that likely import many other components.

### ⚠️ SCOPE GUARD — MANDATORY:
- The refined prompt MUST describe ONLY what the user explicitly asked for.
- If a CURRENT SELECTOR is provided, the refined prompt MUST NOT add tasks like "responsive checks", "child component scaling", "neighboring components", or any change the user did not ask for.
- If the user asked to change one class (e.g. "grid-cols-3 → grid-cols-4"), the refinedPrompt should specify exactly that one change. Do not expand scope.
- The refinedPrompt should result in the minimum number of file edits necessary to accomplish the user's request.

--- CURRENT SELECTOR ---
${currentSelector || "NONE"}
--- END SELECTOR ---

${historyContext}--- AVAILABLE ATTACHMENTS ---
${attachments.length > 0 ? attachments.map(a => `- ${a.name} (${a.type})`).join('\n') : "None"}
--- END ATTACHMENTS ---

USER_REQUEST: ${userMessage}

### OUTPUT:
Provide the JSON following the schema. Ensure 'refinedPrompt' is an expert-level instruction set that is SCOPED to exactly what was asked. If attachments are provided, REFER TO THEM BY THEIR EXACT FILENAME in the 'refinedPrompt'.`;

  logger.log("🔍 Analyzing user intent and refining prompt...");
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  try {
    const parsed = JSON.parse(text);
    if (parsed.isAmbiguous) {
      logger.log("⚠️ Intent analysis: Request is AMBIGUOUS.");
    } else {
      logger.log(`✅ Intent analysis: Request refined. Recommended files: ${parsed.recommendedFiles?.length || 0}`);
    }
    return parsed;
  } catch (err) {
    logger.error("Failed to parse intent analysis:", text);
    return {
      refinedPrompt: userMessage,
      recommendedFiles: [],
      isAmbiguous: false,
      isBigTask: false,
      requiresRecursiveContext: false
    };
  }
}
