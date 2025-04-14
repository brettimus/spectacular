#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { encoding_for_model as encodingForModel } from "tiktoken";

const KNOWLEDGE_BASE_DIR = path.resolve(
  path.join("src", "xstate-prototypes", "spectacular-knowledge"),
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

async function countFileTokens(filePath, models = ["gpt-3.5-turbo", "gpt-4"]) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    const tokenCounts = {};

    // Count tokens for each model
    for (const model of models) {
      tokenCounts[model] = countTokens(content, model);
    }

    // Print file info
    console.log(`\nFile: ${path.basename(filePath)}`);
    console.log(`Size: ${(content.length / 1024).toFixed(2)} KB`);

    // Print token counts for each model
    for (const model of models) {
      console.log(`${model} tokens: ${tokenCounts[model].toLocaleString()}`);
    }

    return {
      filename: path.basename(filePath),
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
      filename: path.basename(filePath),
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

    // Default files to analyze (same as create-knowledge-base.mjs)
    const filesToAnalyze = [
      path.join(KNOWLEDGE_BASE_DIR, "drizzle-docs-2025-04-01_23-37-24-345.md"),
      path.join(KNOWLEDGE_BASE_DIR, "hono-rules-2025-04-02_23-55-02-673.md"),
    ];

    // Track total tokens
    const totalCounts = {};
    for (const model of models) {
      totalCounts[model] = 0;
    }
    let totalBytes = 0;

    // Process each file
    for (const file of filesToAnalyze) {
      const result = await countFileTokens(file, models);

      // Accumulate totals
      totalBytes += result.bytes;
      for (const model of models) {
        totalCounts[model] += result.tokenCounts[model];
      }
    }

    // Print totals
    console.log("\n=== TOTALS ===");
    console.log(`Total size: ${(totalBytes / 1024).toFixed(2)} KB`);
    for (const model of models) {
      console.log(
        `Total ${model} tokens: ${totalCounts[model].toLocaleString()}`,
      );
    }
  } catch (error) {
    console.error("Error counting tokens:", error);
    process.exit(1);
  }
}

main();
