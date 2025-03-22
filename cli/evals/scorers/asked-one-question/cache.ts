import * as fs from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { ScoreCache, ScoreResult } from "./types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the path for the cache file
const CACHE_DIR = path.join(__dirname, ".cache");
const CACHE_FILE = path.join(CACHE_DIR, "asked-one-question-cache.json");

// Initialize the cache from disk or create a new one
const scoreCache: ScoreCache = loadCacheFromDisk();

/**
 * Load the cache from disk, creating a new one if it doesn't exist
 */
function loadCacheFromDisk(): ScoreCache {
  try {
    // Ensure cache directory exists
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }

    // Check if cache file exists
    if (fs.existsSync(CACHE_FILE)) {
      const cacheData = fs.readFileSync(CACHE_FILE, "utf-8");
      return JSON.parse(cacheData);
    }
  } catch (error) {
    console.error("Failed to load cache from disk:", error);
  }

  // Return an empty cache if we couldn't load from disk
  return {};
}

/**
 * Save the cache to disk
 */
function saveCacheToDisk() {
  try {
    // Ensure cache directory exists
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }

    fs.writeFileSync(CACHE_FILE, JSON.stringify(scoreCache, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save cache to disk:", error);
  }
}

/**
 * Cache the scoring result by message ID and persist to disk
 */
export function cacheResult<T extends ScoreResult>(
  messageId: string,
  result: T,
): T {
  if (messageId) {
    scoreCache[messageId] = result;
    // Save to disk after updating the cache
    saveCacheToDisk();
  }
  return result;
}

/**
 * Retrieve cached result by message ID
 */
export function getCachedResult(messageId: string) {
  return messageId ? scoreCache[messageId] : undefined;
}
