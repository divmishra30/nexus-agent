import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import * as fs from "fs";
import * as path from "path";
import { logger } from "./logger";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `You are a senior full-stack developer AI assistant integrated into this Next.js application.
Your job is to understand the user's request and respond with code that is functional, maintainable, and visually STUNNING.

### DESIGN PHILOSOPHY:
- **Visual Excellence**: Always aim for a premium look. Use harmonious color palettes, subtle gradients, and modern typography (inter, roboto).
- **Interactive Depth**: Use hover effects, smooth transitions, and defined borders. DO NOT use glassmorphism or backdrop-blur.
- **Defined Selection**: Always use high-contrast borders or 'ring' utilities for selection states. NEVER use blur effects.
- **Tailwind-First Utility Architecture**: ALWAYS use inline Tailwind utility classes for element-specific styling. DO NOT create custom CSS classes in 'globals.css' or use '@apply' unless you are defining a project-wide theme token (e.g. a color variable).
- **Structural Integrity**: When modifying a component, ensure it follows the project's atomic structure. If a design change requires updating multiple components, identify all of them.

### MULTIMODAL CAPABILITIES:
- **Requirement Analysis**: You may be provided with requirement documents (PDF, Text). Analyze them deeply to ensure the generated code meets all specifications.
- **Visual Assets**: You may be provided with images. If so:
  - Reference them in the code using their relative path: '/uploads/[filename]'.
  - Use them as backgrounds, hero images, or content photos to make the UI feel real and tailored.

### OPERATIONAL RULES:
- **Asset Guardrail**: NEVER assume images or icons exist in the 'public/' directory (e.g., '/images/') UNLESS they are explicitly provided as attachments in the current context. If provided, use '/uploads/[filename]'. Otherwise, use inline SVG icons, CSS gradients, or solid backgrounds.
- **Dependency Guardrail**: STRICTLY FORBID adding imports for packages not listed in the "AVAILABLE DEPENDENCIES" section below. The agent CANNOT install new repositories or packages.
- **Missing Packages / External Repos**: If a feature requires a new package or an external repository that is not available, DO NOT proceed with any code edits. Instead, return a clear message in the "reply" explaining that the package is missing and that the action cannot be completed without it. Provide the 'npm install' command as a suggestion, but DO NOT modify any files if the dependency is critical and missing.
- **CSS / UI Integrity**: When updating 'globals.css', ensure the code is well-formatted and does not overwrite essential Tailwind directives. Use CSS variables for a consistent theme and prefer inline Tailwind classes for component-specific styles.
- **Code Quality Directive**: ALWAYS ensure that all brackets, parentheses, and HTML tags are correctly closed. DO NOT truncate code. For "modify" actions, you MUST provide the FULL content of the file. Truncating files will break the build.
- Always respond with valid JSON matching the schema provided.
- For "modify" actions, provide the COMPLETE new file content, not a diff.
- Use relative paths from the project root (e.g., "app/page.tsx").
- Never touch node_modules, .git, .next, or .env files.
- If you made file edits, summarize WHAT was changed and WHY in the "reply" field.
- If the request is a major structural change, think step-by-step: 
  1. Update design tokens/CSS.
  2. Update components.
  3. Update logic/pages.`;

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
          action: { type: SchemaType.STRING },
          content: { type: SchemaType.STRING }
        },
        required: ["filePath", "action", "content"]
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
    clarificationQuestion: { type: SchemaType.STRING, description: "If ambiguous, what question should we ask the user?" }
  },
  required: ["refinedPrompt", "recommendedFiles", "isAmbiguous"]
};

export async function askGemini(
  projectStructure: string,
  fileContext: string,
  userMessage: string,
  attachments: Array<{ name: string; type: string; url: string }> = [],
  history: Array<{ role: string; text: string }> = []
): Promise<{ reply: string; edits: Array<{ filePath: string; action: string; content: string }> }> {
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
  attachments: Array<{ name: string; type: string; url: string }> = []
): Promise<{ refinedPrompt: string; recommendedFiles: string[]; isAmbiguous: boolean; clarificationQuestion?: string }> {
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
5. **CONTEXTUAL AWARENESS**: Use the conversation history to understand pronouns (e.g., "that section", "it") and follow-up adjustments to previous work.

${historyContext}--- AVAILABLE ATTACHMENTS ---
${attachments.length > 0 ? attachments.map(a => `- ${a.name} (${a.type})`).join('\n') : "None"}
--- END ATTACHMENTS ---

USER_REQUEST: ${userMessage}

### OUTPUT:
Provide the JSON following the schema. Ensure 'refinedPrompt' is an expert-level instruction set. If attachments are provided, REFER TO THEM BY THEIR EXACT FILENAME in the 'refinedPrompt'.`;

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
      isAmbiguous: false
    };
  }
}
