import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import { logger } from "./logger";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `You are a senior full-stack developer agent embedded in a Next.js project.
Your job is to understand the user's request and respond with EITHER:

1. A conversational reply (if the user is asking a question or chatting), OR
2. A JSON block containing file edits to apply to the project.

IMPORTANT RULES:
- Always respond with valid JSON matching the schema provided.
- For "modify" actions, provide the COMPLETE new file content, not a diff.
- Use relative paths from the project root (e.g., "app/page.tsx", not "/app/page.tsx").
- Never touch node_modules, .git, .next, or .env files.
- If you are unsure or the request is ambiguous, ask for clarification in the "reply" field.
- If you made file edits, use the "reply" field to summarize WHAT was changed and WHY (without listing exact file paths unless necessary).
- Keep your explanations concise but helpful.`;

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
  userMessage: string
): Promise<{ reply: string; edits: Array<{ filePath: string; action: string; content: string }> }> {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash", // Using Gemini 2.5 Flash as requested
    generationConfig: { 
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA
    }
  });

  const prompt = `${SYSTEM_PROMPT}

--- PROJECT STRUCTURE ---
${projectStructure}
--- END PROJECT STRUCTURE ---

--- RELEVANT FILE CONTEXT ---
${fileContext}
--- END RELEVANT FILE CONTEXT ---

USER REQUEST: ${userMessage}`;

  logger.log("📤 Sending prompt to Gemini with Response Schema...");
  const result = await model.generateContent(prompt);
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
    
    // Fallback: If it's not JSON, treat it as a conversational reply
    return {
      reply: text.length > 500 ? "I encountered an error processing your request. Please try again with more detail." : text,
      edits: [],
    };
  }
}

export async function analyzeIntent(
  userMessage: string
): Promise<{ refinedPrompt: string; recommendedFiles: string[]; isAmbiguous: boolean; clarificationQuestion?: string }> {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: { 
      responseMimeType: "application/json",
      responseSchema: INTENT_SCHEMA
    }
  });

  const prompt = `You are a Senior Software Architect.
Your job is to take a raw, potentially vague user request and convert it into a HIGHLY ACTIONABLE technical prompt for a code-editing LLM.

### YOUR GOAL:
1. **EXPAND & CLARIFY**: Turn broad requests (e.g., "make it professional") into detailed technical specifications. Never ask for clarification if you can reasonably infer a professional goal.
2. **BE TECHNICAL**: Use expert terminology to describe the desired design system or architectural change.
3. **DO NOT GUESS FILES**: Do NOT name specific files yet.
4. **NO AMBIGUITY**: Do NOT set 'isAmbiguous' to true for broad requests. Only use it for empty input or complete gibberish.

USER_REQUEST: ${userMessage}

### OUTPUT:
Provide the JSON following the schema. Ensure 'refinedPrompt' is a clear, expert instruction that describes the desired state and technical steps.`;

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
