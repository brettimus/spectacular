import type { Context } from "@/context";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import fs from "node:fs";
import path, { dirname } from "node:path";
import { createUserMessage } from "../ideation-agent/utils";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Helper function to resolve rule file paths
 */
function resolveRulePath(ruleName: string, rulesDir: string): string {
  return path.join(rulesDir, `${ruleName}.ts`);
}

// Define interfaces for our data structures
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

const SCHEMA_SYSTEM_PROMPT = `
You are an expert database schema designer specializing in Drizzle ORM with SQLite (D1).
Your task is to analyze a software specification and create an appropriate database schema.

The schema should follow best practices for relational database design:
- Use appropriate data types
- Define proper relationships (foreign keys)
- Include timestamps where appropriate
- Use indexes for columns that will be frequently queried
- Follow naming conventions (snake_case for tables and columns)

The output should be valid TypeScript code using Drizzle ORM syntax for SQLite (D1).
`;

const RULES_SYSTEM_PROMPT = `
You are an expert in database schema design specializing in selecting the appropriate database rules.
Your task is to analyze a list of database tables and operations and determine which rules should be applied.

A rule is a guideline or pattern for implementing specific database features like authentication, real-time data, etc.
`;

export async function analyzeDatabaseTables(ctx: Context) {
  const openai = createOpenAI({ apiKey: ctx.apiKey });
  const model = openai("gpt-4o");
  
  // Ensure we have the spec content
  if (!ctx.specContent) {
    throw new Error("Spec content is required for schema analysis");
  }
  
  return generateObject({
    model,
    schema: z.object({
      reasoning: z.string().describe("Your analysis of the specification and why you chose these tables."),
      tables: z.array(z.object({
        name: z.string().describe("The name of the table in snake_case"),
        description: z.string().describe("A brief description of what this table stores and its purpose"),
        fields: z.array(z.object({
          name: z.string().describe("The name of the field in snake_case"),
          type: z.string().describe("The Drizzle data type"),
          isPrimary: z.boolean().describe("Whether this is a primary key"),
          isRequired: z.boolean().describe("Whether this field is required"),
          isForeignKey: z.boolean().describe("Whether this is a foreign key"),
          references: z.string().optional().describe("If a foreign key, the table and column it references"),
          description: z.string().describe("A brief description of this field")
        }))
      }))
    }),
    messages: [
      createUserMessage(`Please analyze this specification and determine the database tables needed:

${ctx.specContent}`)
    ],
    system: SCHEMA_SYSTEM_PROMPT,
  });
}

export async function identifyDatabaseOperations(ctx: Context, tables: DatabaseTable[]) {
  const openai = createOpenAI({ apiKey: ctx.apiKey });
  const model = openai("gpt-4o");
  
  return generateObject({
    model,
    schema: z.object({
      reasoning: z.string().describe("Your analysis of the operations needed for these tables"),
      operations: z.array(z.object({
        name: z.string().describe("Name of the operation"),
        description: z.string().describe("Detailed description of what this operation does"),
        affectedTables: z.array(z.string()).describe("List of tables this operation affects"),
        complexity: z.enum(["simple", "medium", "complex"]).describe("Complexity level of this operation")
      }))
    }),
    messages: [
      createUserMessage(`Based on the specification and these tables, what database operations will be needed?

Tables:
${JSON.stringify(tables, null, 2)}

Specification:
${ctx.specContent}`)
    ],
    system: SCHEMA_SYSTEM_PROMPT,
  });
}

export async function identifyRelevantRules(ctx: Context, operations: DatabaseOperation[]) {
  const openai = createOpenAI({ apiKey: ctx.apiKey });
  const model = openai("gpt-4o");
  
  // Load available rules - assumed to be in the rules directory in the project
  const rulesDir = ctx.rulesDir;
  if (!rulesDir) {
    throw new Error("Rules directory is required for rule identification");
  }
  
  let rules: string[] = [];
  
  try {
    if (fs.existsSync(rulesDir)) {
      rules = fs.readdirSync(rulesDir)
        .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
        .map(file => file.replace(/\.(ts|js)$/, ''));
    }
  } catch (error) {
    console.error("Error reading rules directory:", error);
  }
  
  // List all available rule files with full paths (mostly for logging)
  const rulePaths = rules.map(rule => resolveRulePath(rule, rulesDir));
  console.log(`Found ${rules.length} rules in ${rulesDir}: ${rulePaths.length > 0 ? rulePaths.join(', ') : 'none'}`);
  
  return generateObject({
    model,
    schema: z.object({
      reasoning: z.string().describe("Your reasoning for selecting these rules"),
      selectedRules: z.array(z.object({
        ruleName: z.string().describe("Name of the rule to apply"),
        priority: z.number().describe("Priority order (1 is highest)"),
        reason: z.string().describe("Why this rule is relevant")
      }))
    }),
    messages: [
      createUserMessage(`Based on these database operations, which rules should be applied? Available rules: ${rules.join(", ")}

Operations:
${JSON.stringify(operations, null, 2)}`)
    ],
    system: RULES_SYSTEM_PROMPT,
  });
}

export async function generateTableSchema(ctx: Context, table: DatabaseTable, relevantRules: SelectedRule[]) {
  const openai = createOpenAI({ apiKey: ctx.apiKey });
  const model = openai("gpt-4o");
  
  return generateObject({
    model,
    schema: z.object({
      schemaCode: z.string().describe("The Drizzle ORM TypeScript code for this table"),
      explanation: z.string().describe("Explanation of the schema design decisions")
    }),
    messages: [
      createUserMessage(`Generate Drizzle ORM schema code for the following table:
      
Table:
${JSON.stringify(table, null, 2)}

Consider these rules when generating the schema:
${JSON.stringify(relevantRules, null, 2)}`)
    ],
    system: SCHEMA_SYSTEM_PROMPT,
  });
}

export async function verifyGeneratedSchema(ctx: Context, schema: string) {
  const openai = createOpenAI({ apiKey: ctx.apiKey });
  const model = openai("gpt-4o");
  
  return generateObject({
    model,
    schema: z.object({
      isValid: z.boolean().describe("Whether the schema is valid"),
      issues: z.array(z.string()).describe("List of issues found, if any"),
      suggestions: z.array(z.string()).describe("Suggestions for improvement"),
      fixedSchema: z.string().describe("The fixed schema, if there were issues")
    }),
    messages: [
      createUserMessage(`Verify this Drizzle ORM schema code and check for any issues or improvements:
      
\`\`\`typescript
${schema}
\`\`\``)
    ],
    system: SCHEMA_SYSTEM_PROMPT,
  });
}

export async function fixSchemaErrors(ctx: Context, schema: string, errorMessage: string) {
  const openai = createOpenAI({ apiKey: ctx.apiKey });
  const model = openai("gpt-4o");
  
  return generateObject({
    model,
    schema: z.object({
      fixedSchema: z.string().describe("The fixed schema code"),
      explanation: z.string().describe("Explanation of the fixes made")
    }),
    messages: [
      createUserMessage(`Fix the errors in this Drizzle ORM schema:
      
\`\`\`typescript
${schema}
\`\`\`

Error output:
${errorMessage}

Please carefully analyze the error output and fix all issues in the schema.
Return the entire fixed schema, not just the changed parts.`)
    ],
    system: `
${SCHEMA_SYSTEM_PROMPT}

You are now specifically tasked with fixing errors in a Drizzle ORM schema.
Analyze compiler errors and runtime errors carefully to understand the root cause.

Common error types you might encounter:
1. Type errors - Mismatches between expected and provided types
2. Missing imports - Required functions or types not imported
3. Syntax errors - Incorrect Drizzle ORM syntax or TypeScript syntax
4. Reference errors - Attempting to use variables that don't exist
5. Runtime errors - Problems that occur when the schema is used at runtime

When fixing errors:
- Understand the complete context before making changes
- Ensure all imports are correct and complete
- Check for typos in field and table names
- Verify that all referenced variables are defined
- Make sure relationship references are correctly defined
- Add any missing schema components
`,
  });
} 