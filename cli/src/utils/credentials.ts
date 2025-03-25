import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Context } from "../context";

interface Credentials {
  apiKeys: Record<string, string>;
  defaultApiKey?: string;
}

const SPECTACULAR_HOME_DIR_NAME = ".spectacular_stuff";
const CREDENTIALS_FILE = "credentials";
const SPECTACULAR_HOME_DIR_PATH = path.join(
  os.homedir(),
  SPECTACULAR_HOME_DIR_NAME,
);
const CREDENTIALS_PATH = path.join(SPECTACULAR_HOME_DIR_PATH, CREDENTIALS_FILE);

/**
 * Ensure the spectacular directory exists
 */
function ensureSpectacularHomeDir(): void {
  if (!fs.existsSync(SPECTACULAR_HOME_DIR_PATH)) {
    fs.mkdirSync(SPECTACULAR_HOME_DIR_PATH, { recursive: true });
  }
}

/**
 * Load credentials from the credentials file
 */
export function loadCredentials(): Credentials {
  try {
    if (fs.existsSync(CREDENTIALS_PATH)) {
      const content = fs.readFileSync(CREDENTIALS_PATH, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Error loading credentials:", error);
  }

  return { apiKeys: {} };
}

/**
 * Save credentials to the credentials file
 */
export function saveCredentials(credentials: Credentials): void {
  try {
    ensureSpectacularHomeDir();
    fs.writeFileSync(
      CREDENTIALS_PATH,
      JSON.stringify(credentials, null, 2),
      "utf-8",
    );
  } catch (error) {
    console.error("Error saving credentials:", error);
  }
}

/**
 * Add or update an API key with a given name
 */
export function saveApiKey(
  name: string,
  apiKey: string,
  setAsDefault = false,
): void {
  const credentials = loadCredentials();
  credentials.apiKeys[name] = apiKey;

  if (setAsDefault) {
    credentials.defaultApiKey = name;
  }

  saveCredentials(credentials);
}

/**
 * Remove an API key by name
 */
export function removeApiKey(name: string): boolean {
  const credentials = loadCredentials();

  if (!credentials.apiKeys[name]) {
    return false;
  }

  delete credentials.apiKeys[name];

  // If we're removing the default key, clear the default
  if (credentials.defaultApiKey === name) {
    credentials.defaultApiKey = undefined;
  }

  saveCredentials(credentials);
  return true;
}

/**
 * Get an API key by name, or the default key if no name is provided
 */
export function getApiKey(name?: string): string | undefined {
  const credentials = loadCredentials();

  if (name) {
    return credentials.apiKeys[name];
  }

  if (credentials.defaultApiKey) {
    return credentials.apiKeys[credentials.defaultApiKey];
  }

  // If there's only one key, return it
  const keys = Object.keys(credentials.apiKeys);
  if (keys.length === 1) {
    return credentials.apiKeys[keys[0]];
  }

  return undefined;
}

/**
 * Set a key as the default
 */
export function setDefaultApiKey(name: string): boolean {
  const credentials = loadCredentials();

  if (!credentials.apiKeys[name]) {
    return false;
  }

  credentials.defaultApiKey = name;
  saveCredentials(credentials);
  return true;
}

/**
 * List all saved API keys
 */
export function listApiKeys(): { name: string; isDefault: boolean }[] {
  const credentials = loadCredentials();

  return Object.keys(credentials.apiKeys).map((name) => ({
    name,
    isDefault: credentials.defaultApiKey === name,
  }));
}

/**
 * Load API key from credentials and set in context
 */
export function loadApiKeyToContext(ctx: Context): void {
  // If API key is already set from environment, keep it
  if (ctx.apiKey) {
    return;
  }

  const apiKey = getApiKey();
  if (apiKey) {
    ctx.apiKey = apiKey;
  }
}

/**
 * Get the path to the spectacular directory
 */
export function getSpectacularHomeDirPath(): string {
  ensureSpectacularHomeDir();
  return SPECTACULAR_HOME_DIR_PATH;
}

/**
 * Save debug information to a file in the spectacular directory
 */
export function saveDebugInfo(filename: string, data: unknown): void {
  try {
    ensureSpectacularHomeDir();
    const debugPath = path.join(SPECTACULAR_HOME_DIR_PATH, filename);
    fs.writeFileSync(debugPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error(`Error saving debug info to ${filename}:`, error);
  }
}

/**
 * Append a log entry to a log file in the spectacular directory
 */
export function appendToLog(
  logname: string,
  entry: string | Record<string, unknown>,
): void {
  try {
    ensureSpectacularHomeDir();
    const logPath = path.join(SPECTACULAR_HOME_DIR_PATH, `${logname}.log`);

    let entryText: string;
    if (typeof entry === "string") {
      entryText = entry;
    } else {
      entryText = JSON.stringify(entry);
    }

    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${entryText}\n`;

    fs.appendFileSync(logPath, logEntry, "utf-8");
  } catch (error) {
    console.error(`Error appending to log ${logname}:`, error);
  }
}

/**
 * Save context-related debug information to the spectacular directory
 * This is a global version of the project-specific saveSpectacularDebugInfo
 */
export function saveGlobalDebugInfo(context: Context): void {
  try {
    ensureSpectacularHomeDir();

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

    const debugPath = path.join(
      SPECTACULAR_HOME_DIR_PATH,
      `debug-${context.sessionId ?? new Date().getTime()}.json`,
    );
    fs.writeFileSync(debugPath, JSON.stringify(history, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving global debug info:", error);
  }
}
