# In-Memory TypeScript Type Checker

This module provides an alternative implementation of the TypeScript type checker that doesn't rely on the filesystem or spawning external processes. Instead, it uses the TypeScript compiler API directly to perform type checking in memory.

## Key Benefits

- **No Filesystem Access**: The type checker works with in-memory file representations
- **No Process Spawning**: Doesn't need to execute `npm run typecheck` or other commands
- **Better Performance**: Avoids the overhead of filesystem I/O and process creation
- **Greater Control**: Direct access to TypeScript compiler options
- **Environment Agnostic**: Works in any JavaScript environment, including browsers

## Usage

### Basic Usage

```typescript
import { validateTypeScriptInMemory } from "./xstate-prototypes/typechecking/in-memory";

const files = [
  { 
    fileName: "index.ts", 
    content: `const x: number = "string"; // Type error` 
  },
  { 
    fileName: "utils.ts", 
    content: `export const add = (a: number, b: number) => a + b;` 
  }
];

// Run the type checker
const errors = await validateTypeScriptInMemory({ files });

// Process the errors
for (const error of errors) {
  console.log(`${error.location}: ${error.message}`);
}
```

### With Custom Compiler Options

```typescript
import * as ts from "typescript";
import { validateTypeScriptInMemory } from "./xstate-prototypes/typechecking/in-memory";

const errors = await validateTypeScriptInMemory({
  files: [...],
  compilerOptions: {
    strict: true,
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    // Other TypeScript compiler options...
  }
});
```

### Integration with XState

```typescript
import { validateTypeScriptInMemoryActor } from "./xstate-prototypes/typechecking/in-memory";
import { createMachine } from "xstate";

const typecheckMachine = createMachine({
  // ...
  invoke: {
    src: validateTypeScriptInMemoryActor,
    input: {
      files: [
        { fileName: "file.ts", content: "/* code */" }
      ]
    },
    onDone: {
      actions: ({ event }) => {
        const errors = event.output;
        // Process the errors
      }
    }
  }
  // ...
});
```

## Running the Test

To compare the in-memory type checker with the filesystem-based version:

```bash
npx tsx src/xstate-prototypes/typechecking/in-memory/test.ts
```

## Files in this Module

- `typecheck.ts` - Main implementation of the in-memory type checker
- `types.ts` - Type definitions
- `example.ts` - Example usage
- `test.ts` - Comparison test with the filesystem-based version
- `index.ts` - Barrel file that exports all functionality 