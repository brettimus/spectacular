#!/usr/bin/env node
import dotenv from 'dotenv';
import { generateFixedSchemas } from './index';

// Load environment variables
dotenv.config();

// Get the root directory (current directory by default)
const rootDir = process.cwd();

// Run the schema generation
console.log(`Starting fixed schema generation from ${rootDir}`);
generateFixedSchemas(rootDir)
  .then(() => {
    console.log('Fixed schema generation complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error generating fixed schemas:', error);
    process.exit(1);
  }); 