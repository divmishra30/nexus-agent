import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY || "";
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
    }
    const result = (await response.json()) as { models: Array<{ name: string; supportedGenerationMethods: string[] }> };
    let output = "Available Models:\n";
    result.models.forEach(m => {
        output += ` - ${m.name} (Supported: ${m.supportedGenerationMethods.join(", ")})\n`;
    });
    fs.writeFileSync("models_list.txt", output);
    console.log("Models list written to models_list.txt");
  } catch (err) {
    fs.writeFileSync("models_list.txt", "Error listing models: " + (err instanceof Error ? err.message : String(err)));
    console.error("Error listing models:", err);
  }
}

listModels();
