import * as fs from "node:fs";
import * as path from "node:path";
import { validateTypeScript } from "../typecheck";
import { validateTypeScriptInMemory } from "./typecheck";
import type { InMemoryFile } from "./types";
import * as os from "node:os";

/**
 * Test function that compares the results of the filesystem-based type checker
 * with the in-memory type checker
 */
async function compareTypeCheckers() {
  console.log(
    "Starting comparison test between filesystem and in-memory type checkers...",
  );

  // Create a temporary directory for the filesystem test
  const tmpDir = path.join(os.tmpdir(), `typescript-test-${Date.now()}`);
  fs.mkdirSync(tmpDir, { recursive: true });
  console.log(`Created temporary directory: ${tmpDir}`);

  try {
    // Sample files for testing
    const files: InMemoryFile[] = [
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

    // Create a package.json file with a typecheck script
    const packageJson = {
      name: "typescript-test",
      version: "1.0.0",
      scripts: {
        typecheck: "tsc --noEmit",
      },
    };

    // Create a tsconfig.json file
    const tsConfig = {
      compilerOptions: {
        strict: true,
        target: "esnext",
        module: "esnext",
        moduleResolution: "nodenext",
        esModuleInterop: true,
        skipLibCheck: true,
      },
    };

    // Write files to the temporary directory
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify(packageJson, null, 2),
    );
    fs.writeFileSync(
      path.join(tmpDir, "tsconfig.json"),
      JSON.stringify(tsConfig, null, 2),
    );

    // Write the test files
    for (const file of files) {
      fs.writeFileSync(path.join(tmpDir, file.fileName), file.content);
    }

    console.log("Files created for testing:");
    for (const file of [
      ...files.map((f) => f.fileName),
      "package.json",
      "tsconfig.json",
    ]) {
      console.log(`- ${file}`);
    }

    // Run the filesystem-based type checker
    console.log("\nRunning filesystem-based type checker...");
    const fsErrors = await validateTypeScript(tmpDir, "npm");

    // Run the in-memory type checker
    console.log("\nRunning in-memory type checker...");
    const inMemoryErrors = await validateTypeScriptInMemory({ files });

    // Compare results
    console.log("\nResults comparison:");
    console.log(`Filesystem errors: ${fsErrors.length}`);
    console.log(`In-memory errors: ${inMemoryErrors.length}`);

    // Print errors for both methods
    console.log("\nFilesystem errors:");
    for (const error of fsErrors) {
      console.log(
        `- ${error.location || "Unknown"}: ${error.severity.toUpperCase()} - ${error.message}`,
      );
    }

    console.log("\nIn-memory errors:");
    for (const error of inMemoryErrors) {
      console.log(
        `- ${error.location || "Unknown"}: ${error.severity.toUpperCase()} - ${error.message}`,
      );
    }

    // Check if the error count is the same
    if (fsErrors.length === inMemoryErrors.length) {
      console.log("\n✅ Both type checkers found the same number of errors!");
    } else {
      console.log("\n❌ Type checkers found different numbers of errors.");
    }

    return {
      fsErrors,
      inMemoryErrors,
      success: fsErrors.length === inMemoryErrors.length,
    };
  } finally {
    // Clean up the temporary directory
    fs.rmSync(tmpDir, { recursive: true, force: true });
    console.log(`\nCleaned up temporary directory: ${tmpDir}`);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  compareTypeCheckers().catch((error) => {
    console.error("Test failed:", error);
    process.exit(1);
  });
}

export { compareTypeCheckers };
