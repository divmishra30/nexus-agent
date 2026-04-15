import * as ts from "typescript";
import { logger } from "./logger";

/**
 * Validates code syntax using the TypeScript compiler API.
 * Supports .ts, .tsx, .js, and .jsx files.
 */
export function validateCode(filePath: string, content: string): { isValid: boolean; error?: string } {
  const extension = filePath.split('.').pop()?.toLowerCase();
  
  let scriptKind = ts.ScriptKind.Unknown;
  if (extension === 'ts') scriptKind = ts.ScriptKind.TS;
  else if (extension === 'tsx') scriptKind = ts.ScriptKind.TSX;
  else if (extension === 'js') scriptKind = ts.ScriptKind.JS;
  else if (extension === 'jsx') scriptKind = ts.ScriptKind.JSX;

  try {
    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true, // setParentNodes
      scriptKind
    );

    // Diagnostics are checked by looking at the parseDiagnostics array
    const diagnostics = (sourceFile as any).parseDiagnostics || [];

    if (diagnostics.length > 0) {
      const firstError = diagnostics[0];
      const message = ts.flattenDiagnosticMessageText(firstError.messageText, "\n");
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(firstError.start!);
      
      const errorDetail = `Syntax error in ${filePath} (${line + 1}:${character + 1}): ${message}`;
      logger.error(`❌ Validation failed: ${errorDetail}`);
      return { isValid: false, error: errorDetail };
    }

    return { isValid: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error(`❌ Validation logic crashed: ${errorMessage}`);
    return { isValid: false, error: `Validator error: ${errorMessage}` };
  }
}
