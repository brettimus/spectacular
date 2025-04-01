import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * Converts a spec name to a path, replacing spaces with dashes and converting to lowercase.
 * If a file with the same name already exists, adds a version suffix (v0, v1, etc.).
 */
export function convertSpecNameToFilename(specName: string) {
  // Double escape the path separator for Windows
  const escapedSep = path.sep === '\\' ? '\\\\' : path.sep;

  const filename = specName
    .replace(new RegExp(`[\\s${escapedSep}]+`, "g"), "-")
    .toLowerCase();
  const baseFilename = filename.endsWith(".md") ? filename : `${filename}.md`;

  // Check if file exists, if not return the original filename
  if (!existsSync(baseFilename)) {
    return baseFilename;
  }

  // If file exists, find the next available version
  let version = 0;
  let versionedFilename = "";

  do {
    // Extract filename without extension
    const extIndex = baseFilename.lastIndexOf(".");
    const nameWithoutExt =
      extIndex !== -1 ? baseFilename.substring(0, extIndex) : baseFilename;
    const extension = extIndex !== -1 ? baseFilename.substring(extIndex) : "";

    versionedFilename = `${nameWithoutExt}-v${version}${extension}`;
    version++;
  } while (existsSync(versionedFilename));

  return versionedFilename;
}

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

export function safeReadFile(path: string) {
  try {
    return readFileSync(path, "utf-8");
  } catch (_error) {
    return null;
  }
}
