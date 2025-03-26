#!/usr/bin/env node
import dotenv from 'dotenv';
import { analyzeSchemaErrorsInReports } from './index';

// Load environment variables
dotenv.config();

// Get the root directory (current directory by default)
const rootDir = process.cwd();

// Run the analysis
console.log(`Starting schema error analysis from ${rootDir}`);
analyzeSchemaErrorsInReports(rootDir)
  .then(() => {
    console.log('Schema error analysis complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error analyzing schema errors:', error);
    process.exit(1);
  }); 