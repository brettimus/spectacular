import * as ts from "typescript";
import type {
  ErrorInfo,
  InMemoryFile,
  ValidateTypescriptInMemoryInputs,
} from "./types";
import { fromPromise } from "xstate";

/**
 * Validates TypeScript code in-memory using the TypeScript compiler API
 * without relying on the filesystem or executing commands.
 */
export async function validateTypeScriptInMemory(
  input: ValidateTypescriptInMemoryInputs,
): Promise<ErrorInfo[]> {
  const { files, compilerOptions = {} } = input;

  // Create a virtual compiler host that uses our in-memory file system
  const compilerHost = createInMemoryCompilerHost(files, compilerOptions);

  // Create a program using our virtual host
  const program = ts.createProgram(
    files.map((f) => f.fileName),
    {
      // Set reasonable defaults
      strict: true,
      noEmit: true,
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      esModuleInterop: true,
      skipLibCheck: true,
      ...compilerOptions,
    },
    compilerHost,
  );

  // Get all diagnostics
  const syntacticDiagnostics = program.getSyntacticDiagnostics();
  const semanticDiagnostics = program.getSemanticDiagnostics();
  const globalDiagnostics = program.getGlobalDiagnostics();

  // Combine all diagnostics
  const allDiagnostics = [
    ...syntacticDiagnostics,
    ...semanticDiagnostics,
    ...globalDiagnostics,
  ];

  // Convert TypeScript diagnostics to our ErrorInfo format
  return convertDiagnosticsToErrorInfo(allDiagnostics);
}

/**
 * Creates an in-memory compiler host with the provided files
 */
function createInMemoryCompilerHost(
  files: InMemoryFile[],
  options: ts.CompilerOptions,
): ts.CompilerHost {
  // Create a map for quick file lookup
  const fileMap = new Map<string, string>();

  // Use for...of instead of forEach
  for (const file of files) {
    fileMap.set(file.fileName, file.content);
  }

  // Create a virtual compiler host
  const compilerHost = ts.createCompilerHost(options);

  // Override file system operations to use our in-memory files
  compilerHost.getSourceFile = (fileName, languageVersion) => {
    const content = fileMap.get(fileName);

    if (content !== undefined) {
      return ts.createSourceFile(fileName, content, languageVersion);
    }

    // For lib files and other dependencies, fall back to the default implementation
    // which will try to load from node_modules
    return ts.createSourceFile(
      fileName,
      ts.sys.readFile(fileName) || "",
      languageVersion,
    );
  };

  compilerHost.readFile = (fileName) => {
    return fileMap.get(fileName) || ts.sys.readFile(fileName) || "";
  };

  compilerHost.fileExists = (fileName) => {
    return fileMap.has(fileName) || ts.sys.fileExists(fileName);
  };

  return compilerHost;
}

/**
 * Converts TypeScript diagnostic messages to our ErrorInfo format
 */
function convertDiagnosticsToErrorInfo(
  diagnostics: readonly ts.Diagnostic[],
): ErrorInfo[] {
  return diagnostics.map((diagnostic) => {
    const message = ts.flattenDiagnosticMessageText(
      diagnostic.messageText,
      "\n",
    );
    const code = `TS${diagnostic.code}`;

    // Get location information if available
    let location: string | undefined = undefined;

    if (diagnostic.file && diagnostic.start !== undefined) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
        diagnostic.start,
      );
      const fileName = diagnostic.file.fileName;
      location = `${fileName}:${line + 1}:${character + 1}`;
    }

    return {
      message: `${code}: ${message}`,
      severity:
        diagnostic.category === ts.DiagnosticCategory.Error
          ? "error"
          : "warning",
      location,
    };
  });
}

// XState actor for in-memory TypeScript validation
export const validateTypeScriptInMemoryActor = fromPromise<
  ErrorInfo[],
  ValidateTypescriptInMemoryInputs
>(({ input }) => validateTypeScriptInMemory(input));
