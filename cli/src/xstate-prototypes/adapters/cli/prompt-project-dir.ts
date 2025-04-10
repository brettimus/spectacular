import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { text } from "@clack/prompts";
import pico from "picocolors";

const DEFAULT_PROJECT_FOLDER = "./spectacular-honc";

export async function promptProjectFolder(cwd: string): Promise<string | null> {
  const placeholder = getPlaceholder();
  const result = await text({
    message: "Where should we create your spec? (./relative-path)",
    placeholder,
    defaultValue: placeholder,
    validate: (value) => validateProjectFolder(value, cwd),
  });

  let projectPath: string | null = null;

  if (typeof result === "string") {
    if (result === "") {
      projectPath = placeholder;
    } else {
      projectPath = pathFromInput(result, cwd);
    }
  }

  return projectPath;
}

export async function actionCreateProjectFolder(projectPath: string) {
  if (!projectPath) {
    throw new Error("Project path is required");
  }

  // Create the project folder
  mkdirSync(projectPath, { recursive: true });

  // Change working directory
  process.chdir(projectPath);

  return;
}

function validateProjectFolder(projectName: string, cwd: string) {
  const doesSpecExist = existsSync(pathFromInput(projectName, cwd));

  if (doesSpecExist) {
    return pico.italic(
      "A Spectacular project already exists in this directory.",
    );
  }

  return undefined;
}

function getPlaceholder() {
  let attempts = 0;
  let placeholder = DEFAULT_PROJECT_FOLDER;
  while (existsSync(placeholder)) {
    placeholder = getRandomProjectFolder();
    attempts++;
    if (attempts > 10) {
      break;
    }
  }
  return placeholder;
}

function getRandomProjectFolder() {
  const adjectives = [
    "dancing",
    "sleepy",
    "grumpy",
    "dizzy",
    "bouncy",
    "sparkly",
    "wobbly",
    "fluffy",
    "sneaky",
    "wiggly",
  ];

  const animals = [
    "penguin",
    "capybara",
    "platypus",
    "quokka",
    "sloth",
    "axolotl",
    "narwhal",
    "wombat",
    "lemur",
    "otter",
  ];

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const number = Math.floor(Math.random() * 90) + 10;
  return `./${adjective}-${animal}-${number?.toString()?.slice(0, 2)}`;
}

/**
 * Turns an input string into a path, adding the current working directory if it's an unqualified name
 */
function pathFromInput(input: string, cwd: string) {
  // Check if it's a bare filename (no directory separators and no relative path markers)
  // Use path.dirname for cross-platform compatibility
  const dirname = path.dirname(input);
  if (dirname === "." && !input.startsWith("./") && !input.startsWith("../")) {
    // It's a bare filename, so add it to the current working directory
    return path.join(cwd, input);
  }

  return input;
}
