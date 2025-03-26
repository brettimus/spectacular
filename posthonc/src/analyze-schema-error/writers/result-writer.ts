import fs from 'node:fs';
import path from 'node:path';
import type { AnalysisResult } from '../types';

/**
 * Write analysis results to a file in the same directory as the report
 */
export function writeAnalysisResult(
  reportDir: string, 
  result: AnalysisResult
): string {
  // Create a unique filename with timestamp
  const uniqueSuffix = Date.now().toString();
  const outputFileName = `schema-error-fix-${uniqueSuffix}.txt`;
  const outputFilePath = path.join(reportDir, outputFileName);
  
  // Format the content
  let outputContent = "OpenAI Response:\n\n";
  outputContent += result.text;
  outputContent += "\n\n----------------------------\n\n";
  
  if (result.sources && result.sources.length > 0) {
    outputContent += "Sources:\n\n";
    outputContent += JSON.stringify(result.sources, null, 2);
  }
  
  // Write to file
  fs.writeFileSync(outputFilePath, outputContent);
  console.log(`Response saved to: ${outputFilePath}`);
  
  return outputFilePath;
} 