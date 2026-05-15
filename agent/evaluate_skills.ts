import * as fs from "fs";
import * as path from "path";
import { askGemini } from "./gemini";
import { logger } from "./logger";

async function evaluateSkill(skillPath: string) {
  const fullPath = path.resolve(skillPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Skill file not found: ${skillPath}`);
    return;
  }

  const content = fs.readFileSync(fullPath, "utf-8");
  
  const evalPrompt = `
You are an AI Technical Evaluator. Your task is to evaluate a "Skill.md" file based on these "Stronger" narrative criteria:

1. **Structured Narrative**: Is it a narrative story of work done, or just a list of instructions?
2. **Evidence-Based Mapping**: Does it map major skills to visible implementation choices (specific files/features)?
3. **Ownership**: Does it explain who contributed what (team members/roles)?
4. **Decisions & Trade-offs**: Does it explain WHY certain technical choices were made?

--- SKILL CONTENT ---
${content}
--- END SKILL CONTENT ---

Provide a detailed evaluation, a score out of 10 for each criterion, and specific suggestions to make it even stronger.
`;

  logger.log(`🔍 Evaluating skill: ${skillPath}...`);
  
  try {
    const result = await askGemini(
      "Evaluator Context",
      content,
      evalPrompt
    );
    
    console.log("\n--- AI EVALUATION REPORT ---");
    console.log(result.reply);
    console.log("----------------------------\n");
  } catch (err) {
    logger.error("Evaluation failed:", err);
  }
}

// Run evaluation on the demo skill
evaluateSkill("demo-skill/Skill.md");
