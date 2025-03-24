#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { intro, isCancel, outro, select } from "@clack/prompts";
import pico from "picocolors";
import { SPECTACULAR_TITLE } from "../const";
import { getSpectacularDirPath } from "../utils/credentials";
import { handleCancel } from "../utils/utils";

export async function commandViewLogs() {
  console.log("");
  console.log(pico.magentaBright(pico.bold(SPECTACULAR_TITLE)));
  console.log("");

  intro("😮 spectacular - View Logs");

  // Get the directory where logs are stored
  const logDir = getSpectacularDirPath();

  // Get all log files
  const files = fs
    .readdirSync(logDir)
    .filter(
      (file) =>
        file.endsWith(".log") ||
        file === "credentials" ||
        file.startsWith("debug-"),
    );

  if (files.length === 0) {
    outro("No log files found.");
    return;
  }

  // Allow user to select a file to view
  const selectedFile = await select({
    message: "Select a file to view",
    options: files.map((file) => ({
      value: file,
      label: file,
    })),
  });

  if (isCancel(selectedFile)) {
    handleCancel();
  }

  const fileName = String(selectedFile);
  const filePath = path.join(logDir, fileName);

  try {
    const content = fs.readFileSync(filePath, "utf-8");

    console.log("");
    console.log(pico.bold(`Contents of ${fileName}:`));
    console.log("");
    console.log(content);
    console.log("");
  } catch (error) {
    console.error(`Error reading file: ${error}`);
  }

  outro("File contents displayed successfully!");
}
