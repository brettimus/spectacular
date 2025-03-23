import type { Context } from "@/context";
import { spinner } from "@clack/prompts";
import fs from "node:fs";
import path from "node:path";
import pico from "picocolors";
import { runShell, handleError } from "@/utils/utils";
import {
  analyzeDatabaseTables,
  identifyDatabaseOperations,
  identifyRelevantRules,
  generateTableSchema,
  verifyGeneratedSchema,
  fixSchemaErrors
} from "@/integrations/schema-agent";

// Proposed implementation of create-schema functionality
//
// 1. Read the spec file (.spectacular/metadata.json->specPath)
// 2. Determine database tables from the spec (LLM call)
// 3. Break down each operation that we want to perform to create the schema (LLM call)
// 4. Select relevant RULES to implement the proposed operations (LLM call)
// 5. For each operation:
//    - ~Search for relevant RULES from 4 to implement the operation (LLM call)~
//    - Generate a schema for each table (LLM call)
// 6. Verify the generated schema with a thinking model (LLM call)
// 7. Save the schema to `db/schema.ts`
// 8. Run `tsc` to compile the code
//    - Feed errors back into a fixer (LLM call)
// 9. Try running `db:generate`
//    - Feed errors back into a fixer (LLM call)
// 10. Save the schema to `db/schema.ts`
//


// Define interfaces matching the schema agent response types
interface TableField {
  name: string;
  type: string;
  isPrimary: boolean;
  isRequired: boolean;
  isForeignKey: boolean;
  references?: string;
  description: string;
}

interface DatabaseTable {
  name: string;
  description: string;
  fields: TableField[];
}

interface DatabaseOperation {
  name: string;
  description: string;
  affectedTables: string[];
  complexity: "simple" | "medium" | "complex";
}

interface SelectedRule {
  ruleName: string;
  priority: number;
  reason: string;
}

// Step tracking interface for state management
interface SchemaGenerationStep {
  step: string;
  status: "pending" | "in-progress" | "completed" | "error";
  message?: string;
  data: {
    tables: DatabaseTable[];
    operations: DatabaseOperation[];
    relevantRules: SelectedRule[];
    tableSchemas: Array<{
      tableName: string;
      schema: string;
      explanation: string;
    }>;
    finalSchema: string;
  };
}

/**
 * Main function to orchestrate the schema creation process
 */
export async function actionCreateSchema(ctx: Context) {
  // Check if spec exists
  if (!ctx.specPath) {
    const metadataPath = path.join(ctx.cwd, ".spectacular", "metadata.json");
    try {
      if (fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
        ctx.specPath = metadata.specPath;
      }
    } catch (error) {
      console.error("Error reading metadata:", error);
      throw new Error("Could not find spec path. Make sure you have a .spectacular/metadata.json file.");
    }
  }

  // Read spec file if not already loaded
  if (!ctx.specContent && ctx.specPath) {
    try {
      if (fs.existsSync(ctx.specPath)) {
        ctx.specContent = fs.readFileSync(ctx.specPath, "utf-8");
      } else {
        throw new Error(`Spec file not found at ${ctx.specPath}`);
      }
    } catch (error) {
      console.error("Error reading spec file:", error);
      throw new Error(`Could not read spec file at ${ctx.specPath}`);
    }
  }
  
  if (!ctx.specContent) {
    throw new Error("No spec content found. Please create a spec first.");
  }

  // Define the initial state for our state machine
  const initialState: SchemaGenerationStep = {
    step: "init",
    status: "pending",
    data: { 
      tables: [],
      operations: [],
      relevantRules: [],
      tableSchemas: [],
      finalSchema: ""
    }
  };

  // Track current state for our state machine
  let currentStep = initialState;
  let stepCount = 0;
  const MAX_STEPS = 20; // Prevent infinite loops

  // Start processing steps
  while (currentStep.step !== "done" && currentStep.step !== "error" && stepCount < MAX_STEPS) {
    stepCount++;
    console.log(`${pico.cyan("→")} Starting step: ${currentStep.step}`);
    
    try {
      currentStep = await processStep(ctx, currentStep);
      if (currentStep.status === "completed") {
        console.log(`${pico.green("✓")} Completed step: ${currentStep.step}`);
      }
    } catch (error) {
      console.error(`${pico.red("✖")} Error in step ${currentStep.step}:`, error);
      currentStep = {
        ...currentStep,
        status: "error",
        message: `Error in step ${currentStep.step}: ${(error as Error).message}`
      };
    }
  }

  // Return final result
  if (currentStep.status === "error") {
    throw new Error(`Schema creation failed: ${currentStep.message}`);
  }
  
  return currentStep.data;
}

/**
 * Process the current step in the schema generation pipeline
 */
async function processStep(ctx: Context, step: SchemaGenerationStep): Promise<SchemaGenerationStep> {
  // If we already have an error, don't continue processing
  if (step.status === "error") {
    return { ...step, step: "error" };
  }

  // Execute step based on current state
  switch (step.step) {
    case "init":
      return {
        step: "analyze_tables",
        status: "pending",
        data: step.data
      };

    case "analyze_tables": {
      const tablesSpinner = spinner();
      try {
        tablesSpinner.start("Analyzing specification to determine database tables...");
        const tableAnalysis = await analyzeDatabaseTables(ctx);
        step.data.tables = tableAnalysis.object.tables;
        tablesSpinner.stop(`Identified ${step.data.tables.length} tables`);
        return {
          step: "identify_operations",
          status: "completed",
          data: step.data
        };
      } catch (error) {
        tablesSpinner.stop("Error analyzing tables");
        handleError(error as Error);
        return {
          step: "analyze_tables",
          status: "error",
          message: `Error analyzing tables: ${(error as Error).message}`,
          data: step.data
        };
      }
    }

    case "identify_operations": {
      const operationsSpinner = spinner();
      try {
        operationsSpinner.start("Identifying database operations...");
        const operationsAnalysis = await identifyDatabaseOperations(ctx, step.data.tables);
        step.data.operations = operationsAnalysis.object.operations;
        operationsSpinner.stop(`Identified ${step.data.operations.length} operations`);
        return {
          step: "identify_rules",
          status: "completed",
          data: step.data
        };
      } catch (error) {
        operationsSpinner.stop("Error identifying operations");
        handleError(error as Error);
        return {
          step: "identify_operations",
          status: "error",
          message: `Error identifying operations: ${(error as Error).message}`,
          data: step.data
        };
      }
    }

    case "identify_rules": {
      const rulesSpinner = spinner();
      try {
        rulesSpinner.start("Identifying relevant rules...");
        const rulesAnalysis = await identifyRelevantRules(ctx, step.data.operations);
        step.data.relevantRules = rulesAnalysis.object.selectedRules;
        rulesSpinner.stop(`Identified ${step.data.relevantRules.length} relevant rules`);
        return {
          step: "generate_table_schemas",
          status: "completed",
          data: step.data
        };
      } catch (error) {
        rulesSpinner.stop("Error identifying rules");
        handleError(error as Error);
        return {
          step: "identify_rules",
          status: "error",
          message: `Error identifying rules: ${(error as Error).message}`,
          data: step.data
        };
      }
    }

    case "generate_table_schemas": {
      const schemaSpinner = spinner();
      try {
        schemaSpinner.start("Generating table schemas...");
        step.data.tableSchemas = [];

        // Process each table one at a time
        for (const table of step.data.tables) {
          schemaSpinner.message(`Generating schema for ${table.name}...`);
          const tableSchema = await generateTableSchema(ctx, table, step.data.relevantRules);
          step.data.tableSchemas.push({
            tableName: table.name,
            schema: tableSchema.object.schemaCode,
            explanation: tableSchema.object.explanation
          });
        }

        // Combine all table schemas into a single schema file
        step.data.finalSchema = combineTableSchemas(step.data.tableSchemas);
        
        schemaSpinner.stop(`Generated schemas for ${step.data.tableSchemas.length} tables`);
        return {
          step: "verify_schema",
          status: "completed",
          data: step.data
        };
      } catch (error) {
        schemaSpinner.stop("Error generating table schemas");
        handleError(error as Error);
        return {
          step: "generate_table_schemas",
          status: "error",
          message: `Error generating table schemas: ${(error as Error).message}`,
          data: step.data
        };
      }
    }

    case "verify_schema": {
      const verifySpinner = spinner();
      try {
        verifySpinner.start("Verifying generated schema...");
        const verification = await verifyGeneratedSchema(ctx, step.data.finalSchema);
        
        if (!verification.object.isValid) {
          verifySpinner.stop("Schema verification found issues, fixing...");
          step.data.finalSchema = verification.object.fixedSchema;
          console.log(`Fixed issues: ${verification.object.issues.join(", ")}`);
        } else {
          verifySpinner.stop("Schema verified successfully");
        }
        
        return {
          step: "save_schema",
          status: "completed",
          data: step.data
        };
      } catch (error) {
        verifySpinner.stop("Error verifying schema");
        handleError(error as Error);
        return {
          step: "verify_schema",
          status: "error",
          message: `Error verifying schema: ${(error as Error).message}`,
          data: step.data
        };
      }
    }

    case "save_schema": {
      const saveSpinner = spinner();
      try {
        saveSpinner.start("Saving schema to src/db/schema.ts...");
        
        // Make sure the db directory exists
        const dbDir = path.join(ctx.cwd, "src", "db");
        if (!fs.existsSync(dbDir)) {
          fs.mkdirSync(dbDir, { recursive: true });
        }
        
        // Save the schema file
        const schemaPath = path.join(dbDir, "schema.ts");
        fs.writeFileSync(schemaPath, step.data.finalSchema);
        
        // Save to context for future reference
        ctx.schemaFile = step.data.finalSchema;
        
        saveSpinner.stop("Schema saved to src/db/schema.ts");
        return {
          step: "compile_schema",
          status: "completed",
          data: step.data
        };
      } catch (error) {
        saveSpinner.stop("Error saving schema");
        handleError(error as Error);
        return {
          step: "save_schema",
          status: "error",
          message: `Error saving schema: ${(error as Error).message}`,
          data: step.data
        };
      }
    }

    case "compile_schema": {
      const compileSpinner = spinner();
      try {
        compileSpinner.start("Compiling schema with TypeScript...");
        
        try {
          const result = await runShell(ctx.cwd, ["tsc --noEmit"]);
          
          if (result.exitCode === 0) {
            compileSpinner.stop("Schema compiled successfully");
            return {
              step: "generate_db",
              status: "completed",
              data: step.data
            };
          }
          
          throw new Error(`TypeScript compilation failed: ${result.stderr}`);
        } catch (compileError) {
          compileSpinner.stop("TypeScript compilation failed, attempting to fix...");
          
          // Extract error message details
          const errorObj = compileError as Error | { stderr: string };
          const errorMessage = 'stderr' in errorObj 
            ? errorObj.stderr 
            : errorObj.message;
          
          const fixSpinner = spinner();
          fixSpinner.start("Fixing TypeScript errors...");
          
          const fixedSchema = await fixSchemaErrors(ctx, step.data.finalSchema, errorMessage);
          step.data.finalSchema = fixedSchema.object.fixedSchema;
          
          // Save the fixed schema
          const schemaPath = path.join(ctx.cwd, "src", "db", "schema.ts");
          fs.writeFileSync(schemaPath, step.data.finalSchema);
          
          fixSpinner.stop(`Schema fixed: ${fixedSchema.object.explanation}`);
          
          // Try compiling again
          try {
            const retryResult = await runShell(ctx.cwd, ["tsc --noEmit"]);
            
            if (retryResult.exitCode === 0) {
              return {
                step: "generate_db",
                status: "completed",
                data: step.data
              };
            }
            
            throw new Error(`TypeScript compilation still failing: ${retryResult.stderr}`);
          } catch (retryError) {
            // Extract error details
            const retryErrorObj = retryError as Error | { stderr: string };
            const retryErrorMessage = 'stderr' in retryErrorObj 
              ? retryErrorObj.stderr 
              : retryErrorObj.message;
              
            return {
              step: "compile_schema",
              status: "error",
              message: `Schema still has TypeScript errors: ${retryErrorMessage}`,
              data: step.data
            };
          }
        }
      } catch (error) {
        compileSpinner.stop("Error during compilation process");
        handleError(error as Error);
        return {
          step: "compile_schema",
          status: "error",
          message: `Error during compilation: ${(error as Error).message}`,
          data: step.data
        };
      }
    }

    case "generate_db": {
      const dbGenSpinner = spinner();
      try {
        dbGenSpinner.start("Running database generation...");
        
        try {
          const result = await runShell(ctx.cwd, [`${ctx.packageManager} run db:generate`]);
          
          if (result.exitCode === 0) {
            dbGenSpinner.stop("Database generation completed successfully");
            return {
              step: "completed",
              status: "completed",
              data: step.data
            };
          }
          
          throw new Error(`Database generation failed: ${result.stderr}`);
        } catch (dbGenError) {
          dbGenSpinner.stop("Database generation failed, attempting to fix...");
          
          // Extract detailed error information
          const errorObj = dbGenError as Error | { stderr: string; stdout: string };
          const errorOutput = 'stderr' in errorObj 
            ? `${errorObj.stderr}\n${errorObj.stdout || ''}` 
            : errorObj.message;
          
          const fixSpinner = spinner();
          fixSpinner.start("Fixing database generation errors...");
          
          const fixedSchema = await fixSchemaErrors(ctx, step.data.finalSchema, errorOutput);
          step.data.finalSchema = fixedSchema.object.fixedSchema;
          
          // Save the fixed schema
          const schemaPath = path.join(ctx.cwd, "src", "db", "schema.ts");
          fs.writeFileSync(schemaPath, step.data.finalSchema);
          
          fixSpinner.stop(`Schema fixed: ${fixedSchema.object.explanation}`);
          
          // Try generating again
          try {
            const retryResult = await runShell(ctx.cwd, [`${ctx.packageManager} run db:generate`]);
            
            if (retryResult.exitCode === 0) {
              return {
                step: "completed",
                status: "completed",
                data: step.data
              };
            }
            
            throw new Error(`Database generation still failing: ${retryResult.stderr}`);
          } catch (retryError) {
            // Extract detailed error information
            const retryErrorObj = retryError as Error | { stderr: string; stdout: string };
            const retryErrorOutput = 'stderr' in retryErrorObj 
              ? `${retryErrorObj.stderr}\n${retryErrorObj.stdout || ''}` 
              : retryErrorObj.message;
              
            return {
              step: "generate_db",
              status: "error",
              message: `Schema still has database generation errors: ${retryErrorOutput}`,
              data: step.data
            };
          }
        }
      } catch (error) {
        dbGenSpinner.stop("Error during database generation");
        handleError(error as Error);
        return {
          step: "generate_db",
          status: "error",
          message: `Error during database generation: ${(error as Error).message}`,
          data: step.data
        };
      }
    }

    case "completed":
      return { ...step, step: "done" };

    default:
      return {
        step: "error",
        status: "error",
        message: `Unknown step: ${step.step}`,
        data: step.data
      };
  }
}

/**
 * Helper function to combine individual table schemas into a single schema file
 */
function combineTableSchemas(tableSchemas: Array<{ tableName: string, schema: string, explanation: string }>) {
  const imports = "import { sqliteTable, text, integer, primaryKey } from \"drizzle-orm/sqlite-core\";\n\n";
  let schemas = '';
  
  // Add each table schema
  for (const { schema } of tableSchemas) {
    schemas += `${schema}\n\n`;
  }
  
  // Return final combined schema
  return `${imports}${schemas}`;
} 