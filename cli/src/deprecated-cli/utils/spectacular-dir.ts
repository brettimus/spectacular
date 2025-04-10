import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Context } from "../context";
import { createLogFilename, getSessionLogDir } from "./logging";

export const SPECTACULAR_PROJECT_DIR_NAME = "spectacular";

/**
 * Path to the spectacular directory
 */
export function getSpectacularProjectDirPath(path: string): string {
  return join(path, SPECTACULAR_PROJECT_DIR_NAME);
}

/**
 * Path to the metadata file
 */
export function getMetadataFilePath(path: string): string {
  return join(path, SPECTACULAR_PROJECT_DIR_NAME, "metadata.json");
}

/**
 * Get the metadata file
 */
export function getMetadataFile(path: string): unknown | null {
  const metadataPath = getMetadataFilePath(path);
  if (!existsSync(metadataPath)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(metadataPath, "utf8"));
  } catch (error) {
    console.error("Error reading metadata:", error);
    return null;
  }
}

/**
 * Check if a spectacular directory exists and contains a valid configuration
 * @returns true if valid configuration exists, false otherwise
 */
export function hasValidSpectacularConfig(path: string): {
  exists: boolean;
  version?: string;
} {
  const spectacularDir = getSpectacularProjectDirPath(path);

  if (!existsSync(spectacularDir)) {
    return { exists: false };
  }

  try {
    const metadataPath = join(spectacularDir, "metadata.json");
    if (existsSync(metadataPath)) {
      const metadata = JSON.parse(readFileSync(metadataPath, "utf8"));
      if (metadata.version) {
        return { exists: true, version: metadata.version };
      }
    }
    return { exists: false };
  } catch (_) {
    return { exists: false };
  }
}

/**
 * Creates the spectacular directory if it doesn't exist
 */
export function ensureSpectacularDir(path: string): void {
  const spectacularDir = getSpectacularProjectDirPath(path);
  if (!existsSync(spectacularDir)) {
    mkdirSync(spectacularDir, { recursive: true });
  }
}

/**
 * Save metadata to the spectacular directory
 */
export function saveSpectacularMetadata(
  path: string,
  specPath: string,
  sessionId: string,
): void {
  const spectacularDir = getSpectacularProjectDirPath(path);
  ensureSpectacularDir(path);

  const now = new Date().toISOString();
  const metadata = {
    sessionId,
    specPath,
    createdAt: now,
    updatedAt: now,
  };

  const metadataPath = join(spectacularDir, "metadata.json");
  writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
}

/**
 * Save debug information to the spectacular directory
 */
export function saveSpectacularInitDebugInfo(
  path: string,
  context: Context,
): void {
  const spectacularDir = getSpectacularProjectDirPath(path);
  ensureSpectacularDir(path);

  const history = {
    apiKey: context.apiKey ? "REDACTED" : "MISSING!",
    cwd: context.cwd,
    packageManager: context.packageManager,
    messages: context.messages,
    specPath: context.specPath,
    specName: context.specName,
    specContent: context.specContent,
    sessionId: context.sessionId,
    timestamp: new Date().toISOString(),
  };

  // Save in both places - project directory for project-specific access and session log dir for better organization
  // Project directory version
  const filename = createLogFilename("init-debug");
  const debugPath = join(spectacularDir, filename);
  writeFileSync(debugPath, JSON.stringify(history, null, 2));

  // Session log dir version - only if sessionId exists
  if (context.sessionId) {
    try {
      const sessionDir = getSessionLogDir(context);
      const sessionLogPath = join(sessionDir, filename);
      writeFileSync(sessionLogPath, JSON.stringify(history, null, 2));
    } catch (error) {
      console.error("Failed to save debug info to session log dir:", error);
    }
  }
}
