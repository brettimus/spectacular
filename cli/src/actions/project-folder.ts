import { existsSync, mkdirSync } from "node:fs";
import type { Context } from "@/context";
import { text } from "@clack/prompts";
import pico from "picocolors";
import { hasValidSpectacularConfig } from "../utils/spectacular-dir";
import { pathFromInput } from "../utils/utils";

const DEFAULT_PROJECT_FOLDER = "./spectacular-honc";

export async function promptProjectFolder(ctx: Context) {
  try {
    const placeholder = getPlaceholder();
    const result = await text({
      message: "Where should we create your spec? (./relative-path)",
      placeholder,
      defaultValue: placeholder,
      validate: (value) => validateProjectFolder(value, ctx),
    });

    if (typeof result === "string") {
      if (result === "") {
        ctx.projectPath = placeholder;
      } else {
        ctx.projectPath = pathFromInput(result, ctx.cwd);
      }
    }

    return result;
  } catch (error) {
    return error;
  }
}

export async function actionCreateProjectFolder(ctx: Context) {
  try {
    if (!ctx.projectPath) {
      throw new Error("Project path is required");
    }

    // Create the project folder
    mkdirSync(ctx.projectPath, { recursive: true });

    // Change working directory
    process.chdir(ctx.projectPath);
    ctx.cwd = process.cwd();

    return;
  } catch (error) {
    return error;
  }
}

function validateProjectFolder(value: string, ctx: Context) {
  const configCheck = hasValidSpectacularConfig(pathFromInput(value, ctx.cwd));

  if (configCheck.exists) {
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
