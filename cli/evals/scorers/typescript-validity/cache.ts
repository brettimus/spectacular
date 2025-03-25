import fs from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { TypeScriptValidityResult } from "./types";

// Get the directory name for the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cache directory path
const CACHE_DIR = path.join(__dirname, ".cache");

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Gets a cached TypeScript validity check result for the given code ID
 */
export function getCachedResult(codeId: string): TypeScriptValidityResult | null {
  const cacheFilePath = path.join(CACHE_DIR, `${codeId}.json`);
  
  if (!fs.existsSync(cacheFilePath)) {
    return null;
  }
  
  try {
    const cachedData = fs.readFileSync(cacheFilePath, "utf8");
    return JSON.parse(cachedData) as TypeScriptValidityResult;
  } catch (error) {
    console.error("Error reading cache file:", error);
    return null;
  }
}

/**
 * Caches a TypeScript validity check result for the given code ID
 */
export function cacheResult(
  codeId: string,
  result: TypeScriptValidityResult
): TypeScriptValidityResult {
  const cacheFilePath = path.join(CACHE_DIR, `${codeId}.json`);
  
  try {
    fs.writeFileSync(cacheFilePath, JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error writing cache file:", error);
  }
  
  return result;
} 