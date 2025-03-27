#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  confirm,
  intro,
  isCancel,
  outro,
  select,
  spinner,
} from "@clack/prompts";
import pico from "picocolors";
import { AutoganderClient } from "../autogander-client";
import { SPECTACULAR_TITLE } from "../const";
import { initContext } from "../context";
import { handleCancel } from "../utils";
import { initCommandLogSession, logActionExecution } from "../utils/logging";

// Constants from logging.ts
const SPECTACULAR_HOME_DIR_NAME = ".spectacular_stuff";
const SPECTACULAR_HOME_DIR_PATH = path.join(
  os.homedir(),
  SPECTACULAR_HOME_DIR_NAME,
);
const AUTOGANDER_TRACKING_FILENAME = "_autogander.json";

interface ApiErrorInfo {
  sessionId: string;
  dirName: string;
  specName: string;
  originalCode?: string;
  errors?: Record<string, unknown> | Array<Record<string, unknown>>;
  fixedCode?: string;
  analysis?: string;
  isSubmitted?: boolean;
  fixId?: string;
}

interface AutoganderTrackingData {
  fixId: string;
  submittedAt: string;
  sessionId: string;
  specName: string;
}

// Helper to check if a session has already been submitted
function hasSessionBeenSubmitted(
  dirPath: string,
  sessionId: string,
): { isSubmitted: boolean; fixId?: string } {
  const trackingFilePath = path.join(dirPath, AUTOGANDER_TRACKING_FILENAME);

  const eventSubmittedFilePath = path.join(dirPath, "action-create-api-autogander-submitted.json");

  if (fs.existsSync(eventSubmittedFilePath)) {
    let fixId = "0";
    try {
      const eventSubmittedData = JSON.parse(
        fs.readFileSync(eventSubmittedFilePath, "utf-8"),
      ) as AutoganderTrackingData;
      fixId = eventSubmittedData.fixId;
    } catch (error) {
      console.error(`Error reading event submitted file ${eventSubmittedFilePath}:`, error);
    }
    return { isSubmitted: true, fixId };
  }

  if (fs.existsSync(trackingFilePath)) {
    try {
      const trackingData = JSON.parse(
        fs.readFileSync(trackingFilePath, "utf-8"),
      ) as AutoganderTrackingData;

      if (trackingData.sessionId === sessionId && trackingData.fixId) {
        return { isSubmitted: true, fixId: trackingData.fixId };
      }
    } catch (error) {
      console.error(`Error reading tracking file ${trackingFilePath}:`, error);
    }
  }

  return { isSubmitted: false };
}

// Helper to track submitted fixes
function trackSubmittedFix(
  dirPath: string,
  fixData: AutoganderTrackingData,
): boolean {
  const trackingFilePath = path.join(dirPath, AUTOGANDER_TRACKING_FILENAME);

  try {
    fs.writeFileSync(
      trackingFilePath,
      JSON.stringify(fixData, null, 2),
      "utf-8",
    );
    return true;
  } catch (error) {
    console.error(`Error writing tracking file ${trackingFilePath}:`, error);
    return false;
  }
}

// List all session directories from the .spectacular_stuff folder with required files
function getSessionDirectoriesWithErrorFiles(
  includeSubmitted = false,
): ApiErrorInfo[] {
  if (!fs.existsSync(SPECTACULAR_HOME_DIR_PATH)) {
    return [];
  }

  const sessionInfos: ApiErrorInfo[] = [];
  const processedSessionIds = new Set<string>();

  const dirs = fs
    .readdirSync(SPECTACULAR_HOME_DIR_PATH, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .filter((dirent) => !dirent.name.endsWith("unknown-project")) // Filter out unknown-project folders
    .map((dirent) => dirent.name);

  for (const dir of dirs) {
    const dirPath = path.join(SPECTACULAR_HOME_DIR_PATH, dir);

    // Check for the required files
    const analyzeErrorsPath = path.join(
      dirPath,
      "create-api-analyze-errors.json",
    );
    const fixErrorsPath = path.join(dirPath, "create-api-fix-errors.json");

    let sessionId: string | undefined;
    let sessionInfo: ApiErrorInfo | undefined;

    // Try to get session ID from analyze errors file
    if (fs.existsSync(analyzeErrorsPath)) {
      try {
        const analyzeData = JSON.parse(
          fs.readFileSync(analyzeErrorsPath, "utf-8"),
        );
        const extractedSessionId = analyzeData.sessionId as string | undefined;

        // If we have a session ID and haven't processed it yet, create a session info
        if (
          extractedSessionId &&
          !processedSessionIds.has(extractedSessionId)
        ) {
          sessionId = extractedSessionId;

          // Check if this session has already been submitted
          const { isSubmitted, fixId } = hasSessionBeenSubmitted(
            dirPath,
            extractedSessionId,
          );

          sessionInfo = {
            sessionId: extractedSessionId,
            dirName: dir,
            specName: dir.split("_").slice(1).join("_"), // Extract project name from dir name
            isSubmitted,
            fixId,
          };

          if (analyzeData.input?.apiCode) {
            sessionInfo.originalCode = analyzeData.input.apiCode;
          }
          if (analyzeData.input?.errorMessages) {
            sessionInfo.errors = analyzeData.input.errorMessages;
          }
          if (analyzeData.output?.analysis) {
            sessionInfo.analysis = analyzeData.output.analysis;
          }
        }
      } catch (error) {
        console.error(`Error parsing ${analyzeErrorsPath}:`, error);
      }
    }

    // If we didn't get session ID from analyze errors, try fix errors
    if (!sessionId && fs.existsSync(fixErrorsPath)) {
      try {
        const fixData = JSON.parse(fs.readFileSync(fixErrorsPath, "utf-8"));
        const extractedSessionId = fixData.sessionId as string | undefined;

        if (extractedSessionId) {
          sessionId = extractedSessionId;

          // Check if this session has already been submitted
          const { isSubmitted, fixId } = hasSessionBeenSubmitted(
            dirPath,
            extractedSessionId,
          );

          // Create session info if we didn't already
          if (!sessionInfo && !processedSessionIds.has(extractedSessionId)) {
            sessionInfo = {
              sessionId: extractedSessionId,
              dirName: dir,
              specName: dir.split("_").slice(1).join("_"), // Extract project name from dir name
              isSubmitted,
              fixId,
            };
          }
        }
      } catch (error) {
        console.error(`Error parsing ${fixErrorsPath}:`, error);
      }
    }

    // Now process the fix errors file to get the fixed code if we have sessionInfo
    if (sessionInfo && fs.existsSync(fixErrorsPath)) {
      try {
        const fixData = JSON.parse(fs.readFileSync(fixErrorsPath, "utf-8"));
        const outputCode = fixData?.output?.code;
        if (outputCode) {
          sessionInfo.fixedCode = outputCode;
        }

        // If we didn't get analysis from analyze-errors, try to get it from fix-errors
        const outputExplanation = fixData?.output?.explanation;
        if (!sessionInfo.analysis && outputExplanation) {
          sessionInfo.analysis = outputExplanation;
        }
      } catch (error) {
        console.error(`Error parsing ${fixErrorsPath}:`, error);
      }
    }

    // Only add sessions that have enough information to submit a fix
    // and filter out already submitted fixes if includeSubmitted is false
    if (
      sessionInfo?.originalCode &&
      (sessionInfo.errors || sessionInfo.analysis) &&
      sessionInfo.fixedCode &&
      (includeSubmitted || !sessionInfo.isSubmitted)
    ) {
      sessionInfos.push(sessionInfo);
      processedSessionIds.add(sessionInfo.sessionId);
    }
  }

  return sessionInfos;
}

// Helper function to list fixes from the database
async function listFixesForSessions(
  client: AutoganderClient,
  sessionIds: string[],
) {
  const progress = spinner();
  progress.start("Fetching fixes from database");

  try {
    let totalFixes = 0;
    const results: Array<{
      sessionId: string;
      success: boolean;
      fixes?: Record<string, unknown>[];
      total?: number;
      error?: string;
    }> = [];

    for (const sessionId of sessionIds) {
      try {
        const result = await client.getFixes(sessionId);
        totalFixes += result.total || 0;
        results.push({
          sessionId,
          success: true,
          fixes: result.fixes || [],
          total: result.total || 0,
        });
      } catch (error) {
        results.push({
          sessionId,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    progress.stop("Done fetching fixes");

    console.log("");
    console.log(pico.bold(`Found ${totalFixes} total fixes in the database`));
    console.log("");

    if (totalFixes > 0) {
      for (const result of results) {
        if (
          result.success &&
          result.total &&
          result.total > 0 &&
          result.fixes
        ) {
          console.log(pico.bold(`Fixes for session ${result.sessionId}:`));
          console.log("");

          for (const fix of result.fixes) {
            const fixObj = fix as Record<string, unknown>;
            console.log(`Fix ID: ${fixObj.id}`);
            console.log(`Type: ${fixObj.type}`);
            console.log(
              `Created: ${new Date(fixObj.createdAt as string).toLocaleString()}`,
            );
            console.log("");
            console.log(pico.dim("--- Analysis ---"));
            console.log(fixObj.analysis);
            console.log("");
            console.log("---------------------------------------");
          }
        }
      }
    }
  } catch (error) {
    progress.stop("Error");
    console.log("");
    console.log(
      pico.red(
        `Error listing fixes: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
  }
}

// Helper to extract error information in the correct format
function normalizeErrorsForSubmission(
  errors: Record<string, unknown> | Array<Record<string, unknown>>,
): Record<string, unknown> {
  if (Array.isArray(errors)) {
    return { messages: errors };
  }
  return errors;
}

/**
 * Command to list all autogander fixes in the database
 */
export async function commandListAutogander() {
  console.log("");
  console.log(pico.magentaBright(pico.bold(SPECTACULAR_TITLE)));
  console.log("");

  intro("😮 spectacular - List Autogander Fixes");

  // Initialize context for logging
  const ctx = initContext();
  // Initialize log session for this command
  initCommandLogSession(ctx, "autogander-list");

  // Create client
  const client = new AutoganderClient();

  // Get all session directories with required files (include already submitted)
  const sessionInfos = getSessionDirectoriesWithErrorFiles(true);

  if (sessionInfos.length === 0) {
    outro(
      "No session directories with API error files found in ~/.spectacular_stuff",
    );
    return;
  }

  // Ask user to select a session or list all
  const options = [
    { value: "all", label: "List fixes for all sessions" },
    ...sessionInfos.map(({ dirName, sessionId, specName, isSubmitted }) => ({
      value: sessionId,
      label: `${specName} (${sessionId}) - ${dirName} ${isSubmitted ? pico.green("[Already submitted]") : ""}`,
    })),
  ];

  const selectedOption = await select({
    message: "Select a session to list fixes",
    options,
  });

  if (isCancel(selectedOption)) {
    handleCancel();
  }

  // Log the action
  logActionExecution(ctx, "autogander", {
    action: "list-fixes",
    sessionIdOrAll: selectedOption,
  });

  if (selectedOption === "all") {
    await listFixesForSessions(
      client,
      sessionInfos.map((s) => s.sessionId),
    );
  } else {
    await listFixesForSessions(client, [selectedOption as string]);
  }

  outro("Listing completed!");
}

/**
 * Command to extract and submit fixes from local logs
 */
export async function commandSubmitFixesToAutogander() {
  console.log("");
  console.log(pico.magentaBright(pico.bold(SPECTACULAR_TITLE)));
  console.log("");

  intro("😮 spectacular - Submit Fixes to Autogander");

  // Initialize context for logging
  const ctx = initContext();
  // Initialize log session for this command
  initCommandLogSession(ctx, "autogander-submit");

  // Create client
  const client = new AutoganderClient();

  // Get all session directories with required files (filter out already submitted)
  const sessionInfos = getSessionDirectoriesWithErrorFiles(false);

  if (sessionInfos.length === 0) {
    outro(
      "No new session directories with API error files found. All sessions may have already been submitted.",
    );
    return;
  }

  console.log("");
  console.log(
    pico.bold(
      `Found ${sessionInfos.length} sessions with new API error files:`,
    ),
  );

  // Ask user to select a session or submit all
  const options = [
    { value: "all", label: "Submit fixes for all sessions" },
    ...sessionInfos.map(({ dirName, sessionId, specName }) => ({
      value: sessionId,
      label: `${specName} (${sessionId}) - ${dirName}`,
    })),
  ];

  const selectedOption = await select({
    message: "Select a session to process",
    options,
  });

  if (isCancel(selectedOption)) {
    handleCancel();
  }

  // Log the action
  logActionExecution(ctx, "autogander", {
    action: "submit-fixes",
    sessionIdOrAll: selectedOption,
  });

  const progress = spinner();

  try {
    if (selectedOption === "all") {
      // Submit fixes for all sessions
      progress.start("Submitting fixes for all sessions");

      const results = [];
      for (const sessionInfo of sessionInfos) {
        try {
          if (
            sessionInfo.originalCode &&
            sessionInfo.errors &&
            sessionInfo.fixedCode
          ) {
            const analysis =
              sessionInfo.analysis || "Automated fix from spectacular logs";
            const response = await client.submitApiFix(
              sessionInfo.sessionId,
              sessionInfo.originalCode,
              normalizeErrorsForSubmission(sessionInfo.errors),
              analysis,
              sessionInfo.fixedCode,
            );

            // Get the fix ID from the response
            const fixId = response.result?.id as string;

            // Track the submitted fix
            if (fixId) {
              const dirPath = path.join(
                SPECTACULAR_HOME_DIR_PATH,
                sessionInfo.dirName,
              );
              const trackingData: AutoganderTrackingData = {
                fixId,
                submittedAt: new Date().toISOString(),
                sessionId: sessionInfo.sessionId,
                specName: sessionInfo.specName,
              };

              const tracked = trackSubmittedFix(dirPath, trackingData);

              results.push({
                sessionId: sessionInfo.sessionId,
                specName: sessionInfo.specName,
                success: true,
                fixId,
                tracked,
              });
            } else {
              results.push({
                sessionId: sessionInfo.sessionId,
                specName: sessionInfo.specName,
                success: true,
                error: "Fix ID not returned from server",
              });
            }
          } else {
            results.push({
              sessionId: sessionInfo.sessionId,
              specName: sessionInfo.specName,
              success: false,
              error: "Missing required data for submission",
            });
          }
        } catch (error) {
          results.push({
            sessionId: sessionInfo.sessionId,
            specName: sessionInfo.specName,
            success: false,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      progress.stop("Done submitting fixes");

      console.log("");
      console.log(pico.bold("Submission results:"));
      console.log("");

      // Display all results
      for (const result of results) {
        if (result.success) {
          if (result.fixId) {
            console.log(
              `- ${pico.green("✓")} ${result.specName} (${result.sessionId}): Successfully submitted fix with ID ${result.fixId}${result.tracked ? "" : ` ${pico.yellow("[Warning: Could not track submission]")}`}`,
            );
          } else {
            console.log(
              `- ${pico.green("✓")} ${result.specName} (${result.sessionId}): Successfully submitted fix - ${result.error || ""}`,
            );
          }
        } else {
          console.log(
            `- ${pico.red("✗")} ${result.specName} (${result.sessionId}): Error - ${result.error}`,
          );
        }
      }

      // Check if any fixes were submitted successfully, then ask user if they want to list fixes
      const successfulSubmissions = results.filter((r) => r.success).length;
      if (successfulSubmissions > 0) {
        const shouldList = await confirm({
          message: `Successfully submitted ${successfulSubmissions} fixes. Would you like to list them from the database?`,
        });

        if (isCancel(shouldList)) {
          handleCancel();
        }

        if (shouldList) {
          await listFixesForSessions(
            client,
            results.filter((r) => r.success).map((r) => r.sessionId),
          );
        }
      }
    } else {
      // Submit fix for single session
      const sessionId = String(selectedOption);
      const sessionInfo = sessionInfos.find(
        (info) => info.sessionId === sessionId,
      );

      if (!sessionInfo) {
        progress.stop("Error");
        outro("Session information not found");
        return;
      }

      if (
        !sessionInfo.originalCode ||
        !sessionInfo.errors ||
        !sessionInfo.fixedCode
      ) {
        progress.stop("Error");
        console.log(pico.red("Missing required data for submission"));
        outro("Cannot submit fix");
        return;
      }

      progress.start(`Submitting fix for ${sessionInfo.specName}`);

      try {
        const analysis =
          sessionInfo.analysis || "Automated fix from spectacular logs";
        const response = await client.submitApiFix(
          sessionInfo.sessionId,
          sessionInfo.originalCode,
          normalizeErrorsForSubmission(sessionInfo.errors),
          analysis,
          sessionInfo.fixedCode,
        );

        // Get the fix ID from the response
        const fixId = response.result?.id as string;

        // Track the submitted fix if we have an ID
        let tracked = false;
        if (fixId) {
          const dirPath = path.join(
            SPECTACULAR_HOME_DIR_PATH,
            sessionInfo.dirName,
          );
          const trackingData: AutoganderTrackingData = {
            fixId,
            submittedAt: new Date().toISOString(),
            sessionId: sessionInfo.sessionId,
            specName: sessionInfo.specName,
          };

          tracked = trackSubmittedFix(dirPath, trackingData);
        }

        progress.stop("Fix submitted successfully");

        console.log("");
        if (fixId) {
          console.log(
            pico.green(`✓ Fix submitted successfully with ID: ${fixId}`),
          );
          if (!tracked) {
            console.log(
              pico.yellow("Warning: Could not save tracking information"),
            );
          }
        } else {
          console.log(pico.green("✓ Fix submitted successfully"));
          console.log(
            pico.yellow(
              "Warning: Fix ID not returned from server, cannot track submission",
            ),
          );
        }
        console.log("");

        // Ask if user wants to list fixes
        const shouldList = await confirm({
          message:
            "Would you like to list all fixes for this session from the database?",
        });

        if (isCancel(shouldList)) {
          handleCancel();
        }

        if (shouldList) {
          await listFixesForSessions(client, [sessionId]);
        }
      } catch (error) {
        progress.stop("Error");
        console.log("");
        console.log(
          pico.red(
            `Error submitting fix: ${error instanceof Error ? error.message : String(error)}`,
          ),
        );
      }
    }
  } catch (error) {
    progress.stop("Error");
    console.log("");
    console.log(
      pico.red(
        `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
  }

  outro("Submission completed!");
}

/**
 * Command to clear _autogander.json tracking files
 */
export async function commandClearAutogander() {
  console.log("");
  console.log(pico.magentaBright(pico.bold(SPECTACULAR_TITLE)));
  console.log("");

  intro("😮 spectacular - Clear Autogander Tracking");

  // Initialize context for logging
  const ctx = initContext();
  // Initialize log session for this command
  initCommandLogSession(ctx, "autogander-clear");

  if (!fs.existsSync(SPECTACULAR_HOME_DIR_PATH)) {
    outro("No .spectacular_stuff directory found");
    return;
  }

  // Find all directories with tracking files
  const dirs = fs
    .readdirSync(SPECTACULAR_HOME_DIR_PATH, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  const dirsWithTrackingFiles = dirs.filter((dir) => {
    const trackingFilePath = path.join(
      SPECTACULAR_HOME_DIR_PATH,
      dir,
      AUTOGANDER_TRACKING_FILENAME,
    );
    return fs.existsSync(trackingFilePath);
  });

  if (dirsWithTrackingFiles.length === 0) {
    outro("No tracking files found in any session directories");
    return;
  }

  console.log("");
  console.log(
    pico.bold(
      `Found ${dirsWithTrackingFiles.length} session directories with tracking files:`,
    ),
  );
  console.log("");

  // List directories with tracking files
  for (const dir of dirsWithTrackingFiles) {
    const trackingFilePath = path.join(
      SPECTACULAR_HOME_DIR_PATH,
      dir,
      AUTOGANDER_TRACKING_FILENAME,
    );
    try {
      const data = JSON.parse(
        fs.readFileSync(trackingFilePath, "utf-8"),
      ) as AutoganderTrackingData;
      console.log(`- ${dir} (${data.specName}, Session ID: ${data.sessionId})`);
    } catch {
      console.log(`- ${dir} (Invalid tracking data)`);
    }
  }

  console.log("");

  // Confirm deletion
  const shouldClear = await confirm({
    message: `Are you sure you want to clear all ${dirsWithTrackingFiles.length} tracking files?`,
  });

  if (isCancel(shouldClear)) {
    handleCancel();
  }

  if (!shouldClear) {
    outro("Operation cancelled");
    return;
  }

  // Log the action
  logActionExecution(ctx, "autogander", {
    action: "clear-tracking",
    count: dirsWithTrackingFiles.length,
  });

  const progress = spinner();
  progress.start("Clearing tracking files");

  // Delete tracking files
  const results = [];
  for (const dir of dirsWithTrackingFiles) {
    const trackingFilePath = path.join(
      SPECTACULAR_HOME_DIR_PATH,
      dir,
      AUTOGANDER_TRACKING_FILENAME,
    );

    try {
      fs.unlinkSync(trackingFilePath);
      results.push({ dir, success: true });
    } catch (error) {
      results.push({
        dir,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  progress.stop("Done clearing tracking files");

  console.log("");
  console.log(pico.bold("Results:"));
  console.log("");

  // Display results
  for (const result of results) {
    if (result.success) {
      console.log(
        `- ${pico.green("✓")} ${result.dir}: Tracking file removed successfully`,
      );
    } else {
      console.log(`- ${pico.red("✗")} ${result.dir}: Error - ${result.error}`);
    }
  }

  const successCount = results.filter((r) => r.success).length;
  outro(
    `Successfully cleared ${successCount} of ${results.length} tracking files`,
  );
}

/**
 * Main command that handles both listing and submitting
 */
export async function commandAutogander() {
  console.log("");
  console.log(pico.magentaBright(pico.bold(SPECTACULAR_TITLE)));
  console.log("");

  intro("😮 spectacular - Autogander Management");

  // Initialize context for logging
  const ctx = initContext();
  // Initialize log session for this command
  initCommandLogSession(ctx, "autogander");

  // Ask user what they want to do
  const actionChoice = await select({
    message: "What would you like to do?",
    options: [
      { value: "submit", label: "Submit fixes to Autogander" },
      { value: "list", label: "List fixes in Autogander" },
      { value: "clear", label: "Clear tracking information" },
    ],
  });

  if (isCancel(actionChoice)) {
    handleCancel();
  }

  if (actionChoice === "submit") {
    await commandSubmitFixesToAutogander();
  } else if (actionChoice === "clear") {
    await commandClearAutogander();
  } else {
    await commandListAutogander();
  }
}
