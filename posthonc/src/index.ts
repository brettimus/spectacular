import dotenv from "dotenv";
import { analyzeSchemaErrorsInReports } from "./analyze-schema-error";
import { generateFixedSchemas } from "./generate-schema-fix";

// Load environment variables
dotenv.config();

// Get the root directory (current directory by default)
const posthoncDir = process.cwd();

async function main() {
  // Step 1: Analyze schema errors
  console.log(`Starting schema error analysis from ${posthoncDir}`);
  await analyzeSchemaErrorsInReports(posthoncDir);
  console.log('Schema error analysis complete!');
  
  // Step 2: Generate fixed schemas
  console.log(`\nStarting fixed schema generation from ${posthoncDir}`);
  await generateFixedSchemas(posthoncDir);
  console.log('Fixed schema generation complete!');
}

// Run the main process
main()
  .then(() => {
    console.log('All processing complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error during processing:', error);
    process.exit(1);
  });
