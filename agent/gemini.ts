import * as fs from "fs";
import * as path from "path";
import { logger } from "./logger";

const GATEWAY_URL = "https://imllm.intermesh.net/v1/chat/completions";
const GATEWAY_KEY = process.env.GATEWAY_API_KEY || "";
const MODEL_NAME = "anthropic/claude-sonnet-4-6";

const SYSTEM_PROMPT = `You are a senior full-stack developer AI assistant integrated into a Next.js application.
Your job is to fulfill the user's request COMPLETELY. You are a "Full Task Completion" agent. This means you should not only make the requested change but also identify and implement any supportive changes needed in related components, styles, or layouts to ensure the feature works perfectly and looks premium.

### DESIGN PHILOSOPHY:
- **Visual Excellence**: Use harmonious color palettes, subtle gradients, and modern typography (Inter, Roboto).
- **Interactive Depth**: Hover effects, smooth transitions, defined borders. Glassmorphism and backdrop-blur are ENCOURAGED for premium headers, sidebars, and overlays.
- **Tailwind-First**: ALWAYS use inline Tailwind utility classes.
- **Structural Integrity**: Follow the project's atomic component structure.

### EDIT FORMAT — CRITICAL RULES:

You have THREE edit action types:

**1. action: "patch"** — USE THIS for targeted changes to existing files.
   - Provide an array of \`patches\` with \`find\` and \`replace\` strings.
   - The \`find\` string MUST be an exact substring present in the current file.
   - Use enough surrounding context in \`find\` to uniquely identify the location.
   - Leave \`content\` as an empty string "".

**2. action: "modify"** — USE THIS for structural changes or when rewriting a significant portion of a file.
   - Provide the COMPLETE new file content in \`content\`.
   - NEVER truncate the file.
   - Leave \`patches\` as an empty array [].

**3. action: "create"** — For new files.

**4. action: "delete"** — To delete a file.

### SCOPE & COMPLETION RULES:
- **End-to-End Fulfillment**: If a user asks for a feature, implement the UI, the state, and any necessary supportive adjustments in parent/sibling files.
- **Proactive Improvement**: If you see a way to make the requested change "premium" (e.g. adding a blur effect to a sticky header), do it proactively.
- **Reliability First**: If a file is under 600 lines, PREFER the "modify" action (full file) to ensure perfect structural integrity and avoid patch failures.
- **Route-Aware Focus**: Prioritize files in the current route's folder, but don't hesitate to modify global layouts or styles if the task requires it.
- **No Truncation**: Always provide full file content for "modify" and "create". No "// ... rest of file".
- **String Safety**: In React/TSX, use backticks (Template Literals) for complex HTML or strings containing apostrophes.
- **Specialized Skills**: Check the "SPECIALIZED SKILLS" section below for project-specific "how-to" guides and coding patterns. PRIORITIZE these skills over general knowledge.
- Respond with valid JSON matching the schema. Summarize everything you changed and WHY in the "reply" field.`;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    reply: { type: "string" },
    edits: {
      type: "array",
      items: {
        type: "object",
        properties: {
          filePath: { type: "string" },
          action: { type: "string", enum: ["patch", "modify", "create", "delete"] },
          content: { type: "string" },
          patches: {
            type: "array",
            items: {
              type: "object",
              properties: {
                find: { type: "string" },
                replace: { type: "string" }
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

const INTENT_SCHEMA = {
  type: "object",
  properties: {
    refinedPrompt: { type: "string" },
    recommendedFiles: { type: "array", items: { type: "string" } },
    isAmbiguous: { type: "boolean" },
    clarificationQuestion: { type: "string" },
    isBigTask: { type: "boolean" },
    requiresRecursiveContext: { type: "boolean" }
  },
  required: ["refinedPrompt", "recommendedFiles", "isAmbiguous", "isBigTask", "requiresRecursiveContext"]
};

/**
 * Robustly extracts and parses JSON from a string that may contain markdown blocks or extra text.
 */
function extractJson(text: string): any {
  const cleaned = text.trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Try to extract content between first '{' and last '}'
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      const jsonStr = cleaned.substring(start, end + 1);
      try {
        return JSON.parse(jsonStr);
      } catch (innerErr: any) {
        // Try to remove markdown code blocks
        const markdownMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (markdownMatch && markdownMatch[1]) {
          try {
            return JSON.parse(markdownMatch[1].trim());
          } catch (finalErr: any) {
            throw new Error(`Failed to parse extracted JSON: ${innerErr.message || String(innerErr)}`);
          }
        }
        throw new Error(`Found JSON markers but failed to parse: ${innerErr.message || String(innerErr)}`);
      }
    }
    throw new Error(`No JSON object found in response.`);
  }
}

async function callGateway(messages: any[], responseSchema: any) {
  if (!GATEWAY_KEY) {
    throw new Error("GATEWAY_API_KEY is not configured.");
  }

  const response = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GATEWAY_KEY}`
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages,
      response_format: { type: "json_object" },
      temperature: 0.1
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gateway Error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  const content = result.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error("Gateway returned an empty response.");
  }

  try {
    const parsed = extractJson(content);
    
    // Safety check: ensure edits are meaningful
    if (parsed.edits && Array.isArray(parsed.edits)) {
      parsed.edits = parsed.edits.filter((edit: any) => {
        if ((edit.action === "modify" || edit.action === "create") && !edit.content) {
          logger.error(`🚫 Rejecting empty content for ${edit.filePath}`);
          return false;
        }
        if (edit.action === "patch" && (!edit.patches || edit.patches.length === 0)) {
          logger.error(`🚫 Rejecting empty patches for ${edit.filePath}`);
          return false;
        }
        return true;
      });
    }

    return parsed;
  } catch (err: any) {
    logger.error("Failed to parse LLM JSON response:", content);
    throw new Error(`LLM response was not valid JSON: ${err.message}`);
  }
}

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
  
  // 1. Get dependencies and skills for context
  let dependencies = "Unknown";
  try {
    const pkgPath = path.join(process.cwd(), "package.json");
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      dependencies = JSON.stringify({ ...pkg.dependencies, ...pkg.devDependencies }, null, 2);
    }
  } catch (e) {
    logger.error("Failed to read package.json", e);
  }

  let skills = "None defined.";
  try {
    const skillsPath = path.join(process.cwd(), "skills.md");
    if (fs.existsSync(skillsPath)) {
      skills = fs.readFileSync(skillsPath, "utf-8");
    }
  } catch (e) {
    logger.error("Failed to read skills.md", e);
  }

  const fullPrompt = `${SYSTEM_PROMPT}

--- PROJECT STRUCTURE ---
${projectStructure}
--- END PROJECT STRUCTURE ---

--- AVAILABLE DEPENDENCIES ---
${dependencies}
--- END AVAILABLE DEPENDENCIES ---

--- SPECIALIZED SKILLS (PRIORITIZE THESE) ---
${skills}
--- END SPECIALIZED SKILLS ---

--- RELEVANT FILE CONTEXT ---
${fileContext}
--- END RELEVANT FILE CONTEXT ---

--- ATTACHMENTS (Images/Docs) ---
${attachments.length > 0 ? attachments.map(a => `- Name: ${a.name}, Type: ${a.type}`).join('\n') : "None provided."}
--- END ATTACHMENTS ---

--- CURRENT ELEMENT FOCUS ---
${currentSelector ? `Selector: "${currentSelector}"` : "No specific element selected."}
--- END CURRENT ELEMENT FOCUS ---

--- CURRENT ELEMENT CODE ---
${elementCodeSnippet ? elementCodeSnippet : "No specific code snippets extracted."}
--- END CURRENT ELEMENT CODE ---

--- PRIMARY TARGETS ---
${pinnedFiles.length > 0 ? pinnedFiles.map(f => `  - ${f}`).join('\n') : "No files pinned."}
--- END PRIMARY TARGETS ---

USER REQUEST: ${userMessage}

Respond STRICTLY with JSON following this schema: ${JSON.stringify(RESPONSE_SCHEMA)}`;

  // 2. Format messages for OpenAI/Gateway
  const messages: any[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map(h => ({ role: h.role === "model" ? "assistant" : "user", content: h.text })),
  ];

  // 3. Add multimodal content for the latest message
  const userContent: any[] = [{ type: "text", text: fullPrompt }];
  
  if (attachments && attachments.length > 0) {
    for (const attachment of attachments) {
      try {
        const filePath = path.join(process.cwd(), "public", "uploads", attachment.name);
        if (fs.existsSync(filePath)) {
          const buffer = fs.readFileSync(filePath);
          const base64 = buffer.toString("base64");
          userContent.push({
            type: "image_url",
            image_url: { url: `data:${attachment.type};base64,${base64}` }
          });
          logger.log(`✅ Attached ${attachment.name} to Gateway request.`);
        }
      } catch (err) {
        logger.error(`❌ Failed to attach ${attachment.name}:`, err);
      }
    }
  }

  messages.push({ role: "user", content: userContent });

  logger.log(`📤 Sending prompt to LLM Gateway (${MODEL_NAME})...`);
  try {
    const result = await callGateway(messages, RESPONSE_SCHEMA);
    return {
      reply: result.reply || "Done.",
      edits: Array.isArray(result.edits) ? result.edits : []
    };
  } catch (err: any) {
    logger.error("Gateway request failed:", err);
    return {
      reply: `I encountered an error using the LLM Gateway: ${err.message}. Please check your connection and access key.`,
      edits: []
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
  const prompt = `You are a Senior Software Architect and UX Strategist.
Your job is to translate raw user requests into RIGOROUS technical specifications for a code-editing LLM.

### YOUR GOAL:
1. **STRUCTURAL DECOMPOSITION**: Identify all affected layers (UI, State, API, Styles).
2. **UX ENHANCEMENT**: Proactively recommend premium design patterns (Glassmorphism, HSL colors, micro-animations).
3. **CONTEXT SEARCH**: Recommend ALL files needed for a complete implementation.
4. **PHASED PLANNING**: Refine the prompt to include a step-by-step implementation plan.
5. **CONTEXTUAL PRECISION**: Focus on the 'CURRENT SELECTOR' if provided.

--- CURRENT SELECTOR ---
${currentSelector || "NONE"}
--- END SELECTOR ---

--- HISTORY ---
${history.map(h => `${h.role}: ${h.text}`).join('\n')}
--- END HISTORY ---

USER_REQUEST: ${userMessage}

Respond STRICTLY with JSON following this schema: ${JSON.stringify(INTENT_SCHEMA)}`;

  const messages = [
    { role: "system", content: "You are a Senior Software Architect. Respond with valid JSON only." },
    { role: "user", content: prompt }
  ];

  logger.log("🔍 Analyzing user intent via LLM Gateway...");
  try {
    return await callGateway(messages, INTENT_SCHEMA);
  } catch (err) {
    logger.error("Intent analysis failed:", err);
    return {
      refinedPrompt: userMessage,
      recommendedFiles: [],
      isAmbiguous: false,
      isBigTask: false,
      requiresRecursiveContext: false
    };
  }
}
