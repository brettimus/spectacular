import path from 'node:path';
import { findDirectoriesForAnalysis } from './readers/directory-reader';
import { findReportFile, extractSchemaData } from './readers/report-reader';
import { analyzeSchemaErrors } from './utils/analyzer';
import { writeAnalysisResult } from './writers/result-writer';

/**
 * Main function to analyze schema errors in reports
 */
export async function analyzeSchemaErrorsInReports(rootDir: string): Promise<void> {
  try {
    console.log('Finding directories for analysis...');
    const dirs = findDirectoriesForAnalysis(rootDir);
    
    if (dirs.length === 0) {
      console.log('No directories found needing schema error analysis.');
      return;
    }
    
    console.log(`Found ${dirs.length} directories to analyze.`);
    
    // Process each directory
    for (const dir of dirs) {
      console.log(`Processing directory: ${dir}`);
      
      // Find the report file
      const reportPath = findReportFile(dir);
      if (!reportPath) {
        console.log(`No report file found in ${dir}, skipping.`);
        continue;
      }
      
      // Extract schema data
      const schemaData = extractSchemaData(reportPath);
      if (!schemaData) {
        console.log(`No valid schema data found in ${reportPath}, skipping.`);
        continue;
      }
      
      // Analyze errors
      const analysisResult = await analyzeSchemaErrors(schemaData);
      if (!analysisResult) {
        console.log(`Error analyzing schema in ${reportPath}, skipping.`);
        continue;
      }
      
      // Write results to file in the same directory as the report
      const reportDir = path.dirname(reportPath);
      writeAnalysisResult(reportDir, analysisResult);
    }
    
    console.log('Analysis complete!');
  } catch (error) {
    console.error('Error analyzing schema errors:', error);
  }
}