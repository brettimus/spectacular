import path from "node:path";

/**
 * Turns an input string into a path, adding the current working directory if it's an unqualified name
 */
export function pathFromInput(input: string, cwd: string) {
  // Check if it's a bare filename (no directory separators and no relative path markers)
  // Use path.dirname for cross-platform compatibility
  const dirname = path.dirname(input);
  if (dirname === "." && !input.startsWith("./") && !input.startsWith("../")) {
    // It's a bare filename, so add it to the current working directory
    return path.join(cwd, input);
  }

  return input;
}
