import { config } from "dotenv";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import {
  addTimestampToProjectDirName,
  setUpLogsDir,
  setUpProjectDir,
  verifyCurrentDir,
  writeSpecToFile,
} from "./utils";
import { createSpec } from "./create-spec";
import { autoSpectacular } from "./auto-spectacular";
import type { FpModelProvider } from "@/xstate-prototypes/ai";
import { getAiConfig } from "./ai-config";
import { configure, getLogger } from "@logtape/logtape";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config();

// Configure a dedicated logging directory
const MAX_ITERATIONS = 20;
const CENTRAL_LOGS_DIR = path.join(
  process.cwd(),
  "..",
  "..",
  "spectacular-loop-logs",
);

// Create the central logs directory if it doesn't exist
if (!fs.existsSync(CENTRAL_LOGS_DIR)) {
  fs.mkdirSync(CENTRAL_LOGS_DIR, { recursive: true });
}

// Configure logger with file sink
async function setupLogger() {
  await configure({
    sinks: {
      console: (log) => {
        console.log(log);
      },
      file: (log) => {
        const logFilePath = path.join(CENTRAL_LOGS_DIR, "autonomous-loop.log");
        const logEntry = `${new Date().toISOString()} - ${JSON.stringify(log)}\n`;
        fs.appendFileSync(logFilePath, logEntry);
      },
    },
    loggers: [
      {
        category: ["spectacular-cli"],
        sinks: ["console", "file"],
      },
    ],
  });
}

// Initialize the logger
await setupLogger();
const logger = getLogger(["spectacular-cli"]);

const AI_PROVIDER: FpModelProvider = "anthropic";
const AI_CONFIG = getAiConfig(AI_PROVIDER);

const cliProjectRoot = process.cwd();

if (!AI_CONFIG.apiKey) {
  throw new Error(`AI provider (${AI_PROVIDER}) API key is not set`);
}

logger.info(`Starting autonomous loop with max ${MAX_ITERATIONS} iterations`);

for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration++) {
  logger.info(`Beginning iteration ${iteration} of ${MAX_ITERATIONS}`);

  try {
    logger.info("Creating spec");

    const specDetails = await createSpec(AI_CONFIG);

    logger.info("Spec created");
    logger.info(`specDetails.projectDirName: ${specDetails.projectDirName}`);

    if (!specDetails.spec) {
      throw new Error("Spec file not found");
    }

    const projectName = addTimestampToProjectDirName(
      `${specDetails.projectDirName}-iter-${iteration}`,
    );

    verifyCurrentDir({ cliProjectRoot, __dirname });

    const projectDir = path.join(
      cliProjectRoot,
      "..",
      "..",
      "spectacular-autonomous",
      projectName,
    );

    setUpProjectDir({ projectDir });
    writeSpecToFile({ projectDir, spec: specDetails.spec });

    const logsDir = setUpLogsDir({ projectDir });

    // Link this run's logs to the central logs directory for easier access
    fs.symlinkSync(
      logsDir,
      path.join(
        CENTRAL_LOGS_DIR,
        `iter-${iteration}-${path.basename(logsDir)}`,
      ),
      "dir",
    );

    logger.info(`Running autoSpectacular for iteration ${iteration}`);

    await autoSpectacular({
      apiKey: AI_CONFIG.apiKey,
      aiProvider: AI_CONFIG.aiProvider,
      spec: specDetails.spec,
      projectDir,
      logsDir,
    });

    logger.info(`Completed iteration ${iteration} successfully`);
  } catch (error) {
    // Log the error but continue with the next iteration
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : "No stack trace";

    logger.error(`Error in iteration ${iteration}: ${errorMessage}`, {
      stack: errorStack,
      iteration,
    });

    // Write detailed error info to a separate file
    const errorLogPath = path.join(
      CENTRAL_LOGS_DIR,
      `error-iter-${iteration}.json`,
    );
    fs.writeFileSync(
      errorLogPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          iteration,
          error: errorMessage,
          stack: errorStack,
        },
        null,
        2,
      ),
    );
  }

  // Add a delay between iterations to prevent rate limiting
  if (iteration < MAX_ITERATIONS) {
    const delaySeconds = 5;
    logger.info(`Waiting ${delaySeconds} seconds before next iteration...`);
    await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000));
  }
}

logger.info(`Autonomous loop completed after ${MAX_ITERATIONS} iterations`);
