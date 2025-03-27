import fs from "node:fs";
import path from "node:path";

/**
 * Find the most recent schema error fix file in a directory
 */
export function findFixFile(dirPath: string): string | null {
  if (!fs.existsSync(dirPath)) {
    return null;
  }

  const files = fs
    .readdirSync(dirPath)
    .filter(
      (file) => file.startsWith("schema-error-fix") && file.endsWith(".txt"),
    );

  if (files.length === 0) {
    return null;
  }

  // Sort by filename to get most recent (assuming timestamp naming)
  files.sort().reverse();
  return path.join(dirPath, files[0]);
}
