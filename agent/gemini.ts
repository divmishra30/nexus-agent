import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "./logger";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `You are a senior full-stack developer agent embedded in a Next.js project.
Your job is to understand the user's request and respond with EITHER:

1. A conversational reply (if the user is asking a question or chatting), OR
2. A JSON block containing file edits to apply to the project.

When returning file edits, respond with ONLY a JSON object in this exact format:
{
  "reply": "Brief explanation of what you did",
  "edits": [
    {
      "filePath": "relative/path/to/file.tsx",
      "action": "create" | "modify" | "delete",
      "content": "full file content for create/modify, empty string for delete"
    }
  ]
}

When returning a conversational reply (no file edits), respond with ONLY:
{
  "reply": "Your conversational message here",
  "edits": []
}

IMPORTANT RULES:
- Always respond with valid JSON matching the schema above.
- For "modify" actions, provide the COMPLETE new file content, not a diff.
- Use relative paths from the project root (e.g., "app/page.tsx", not "/app/page.tsx").
- Never touch node_modules, .git, .next, or .env files.
- Keep your explanations concise but helpful.`;

export async function askGemini(
  fileContext: string,
  userMessage: string
): Promise<{ reply: string; edits: Array<{ filePath: string; action: string; content: string }> }> {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `${SYSTEM_PROMPT}

--- PROJECT FILES (for context) ---
${fileContext}
--- END PROJECT FILES ---

USER REQUEST: ${userMessage}`;

  logger.log("📤 Sending prompt to Gemini...");
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  logger.log("📥 Received response from Gemini.");

  // Extract JSON from the response (handle potential markdown code blocks or extra text)
  let jsonStr = text.trim();
  
  // If it starts with ```json or ```, try to extract the content
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  } else {
    // Sometimes Gemini might return JSON with some prefix/suffix even in JSON mode if the prompt is complex
    // Find the first '{' and last '}'
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      jsonStr = text.substring(startIdx, endIdx + 1);
    }
  }

  try {
    const parsed = JSON.parse(jsonStr);
    logger.log(`✅ Parsed Gemini JSON. Edits: ${parsed.edits?.length || 0}`);
    return {
      reply: parsed.reply || "Done.",
      edits: Array.isArray(parsed.edits) ? parsed.edits : [],
    };
  } catch (err) {
    logger.log(`⚠️ Gemini response was not valid JSON: ${err instanceof Error ? err.message : String(err)}`);
    logger.log("Returning full response as plain text.");
    // If Gemini didn't return valid JSON, treat the whole response as a reply
    return {
      reply: text,
      edits: [],
    };
  }
}
