#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { encoding_for_model as encodingForModel } from "tiktoken";

const KNOWLEDGE_BASE_DIR = path.resolve(
  path.join("src", "spectacular-knowledge"),
);

const RULES_DIR = path.resolve(
  path.join(KNOWLEDGE_BASE_DIR, "rules"),
);

/**
 * Count tokens using OpenAI's tiktoken library
 * @param {string} text - Text to count tokens for
 * @param {string} model - OpenAI model name
 * @returns {number} - Token count
 */
function countTokens(text, model = "gpt-4") {
  const enc = encodingForModel(model);
  try {
    const tokens = enc.encode(text);
    return tokens.length;
  } finally {
    // Always free the encoding to prevent memory leaks
    enc.free();
  }
}

/**
 * Recursively get all files in a directory
 * @param {string} dirPath - Directory to scan
 * @returns {Promise<string[]>} - Array of file paths
 */
async function getAllFiles(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        return getAllFiles(fullPath);
      }
      return fullPath;
    }),
  );
  return files.flat();
}

async function countFileTokens(filePath, models = ["gpt-3.5-turbo", "gpt-4"]) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    const tokenCounts = {};

    // Count tokens for each model
    for (const model of models) {
      tokenCounts[model] = countTokens(content, model);
    }

    // Print file info
    console.log(`\nFile: ${filePath}`);
    console.log(`Size: ${(content.length / 1024).toFixed(2)} KB`);

    // Print token counts for each model
    for (const model of models) {
      console.log(`${model} tokens: ${tokenCounts[model].toLocaleString()}`);
    }

    return {
      filename: filePath,
      bytes: content.length,
      tokenCounts,
    };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    const emptyTokenCounts = {};
    for (const model of models) {
      emptyTokenCounts[model] = 0;
    }

    return {
      filename: filePath,
      bytes: 0,
      tokenCounts: emptyTokenCounts,
    };
  }
}

async function main() {
  try {
    // Models to count tokens for
    const models = ["gpt-3.5-turbo", "gpt-4"];

    // Check if a specific file is provided
    const targetFile = process.argv[2];

    if (targetFile) {
      // Count tokens in the specified file
      const filePath = path.resolve(targetFile);
      await countFileTokens(filePath, models);
      return;
    }

    // Get rule directories
    const rulesEntries = await fs.readdir(RULES_DIR, { withFileTypes: true });
    const ruleDirs = [
      RULES_DIR, // Include root rules dir
      ...rulesEntries
        .filter(entry => entry.isDirectory())
        .map(dir => path.join(RULES_DIR, dir.name))
    ];

    // Track global totals
    const globalTotalCounts = {};
    for (const model of models) {
      globalTotalCounts[model] = 0;
    }
    let globalTotalBytes = 0;

    // Process each rule directory
    for (const ruleDir of ruleDirs) {
      console.log(`\n\n=== Processing ${path.basename(ruleDir)} ===`);
      
      // Get all files in this directory
      let filesToAnalyze;
      try {
        filesToAnalyze = await getAllFiles(ruleDir);
      } catch (error) {
        console.error(`Error getting files from ${ruleDir}:`, error);
        continue;
      }
      
      // Skip if no files found
      if (filesToAnalyze.length === 0) {
        console.log(`No files found in ${ruleDir}`);
        continue;
      }

      // Track directory totals
      const dirTotalCounts = {};
      for (const model of models) {
        dirTotalCounts[model] = 0;
      }
      let dirTotalBytes = 0;

      // Process each file
      for (const file of filesToAnalyze) {
        const result = await countFileTokens(file, models);

        // Accumulate directory totals
        dirTotalBytes += result.bytes;
        for (const model of models) {
          dirTotalCounts[model] += result.tokenCounts[model];
        }
        
        // Accumulate global totals
        globalTotalBytes += result.bytes;
        for (const model of models) {
          globalTotalCounts[model] += result.tokenCounts[model];
        }
      }

      // Print directory totals
      console.log(`\n=== ${path.basename(ruleDir)} TOTALS ===`);
      console.log(`Files analyzed: ${filesToAnalyze.length}`);
      console.log(`Total size: ${(dirTotalBytes / 1024).toFixed(2)} KB`);
      for (const model of models) {
        console.log(
          `Total ${model} tokens: ${dirTotalCounts[model].toLocaleString()}`,
        );
      }
    }

    // Print global totals
    console.log("\n\n=== GLOBAL TOTALS ===");
    console.log(`Total size: ${(globalTotalBytes / 1024).toFixed(2)} KB`);
    for (const model of models) {
      console.log(
        `Total ${model} tokens: ${globalTotalCounts[model].toLocaleString()}`,
      );
    }
  } catch (error) {
    console.error("Error counting tokens:", error);
    process.exit(1);
  }
}

main();
