import { validateTypeScriptInMemory } from "./typecheck";

async function main() {
  // Example TypeScript files with errors
  const files = [
    {
      fileName: "index.ts",
      content: `
        import { helper } from './helper';
        
        const x: number = "not a number"; // Type error
        console.log(x);
        
        const result = helper(5);
        console.log(result);
      `,
    },
    {
      fileName: "helper.ts",
      content: `
        export function helper(input: number): string {
          return "The value is: " + input;
        }
        
        // Undefined variable error
        console.log(undefinedVariable);
      `,
    },
  ];

  try {
    // Run the type checker
    const errors = await validateTypeScriptInMemory({ files });

    // Print out the errors
    console.log("TypeScript validation errors:");

    if (errors.length === 0) {
      console.log("No errors found!");
    } else {
      for (const error of errors) {
        console.log(
          `${error.location || "Unknown location"}: ${error.severity.toUpperCase()} - ${error.message}`,
        );
      }
    }
  } catch (error) {
    console.error("Error running type checker:", error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { main as runInMemoryTypecheckExample };
