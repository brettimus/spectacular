import type { Context } from "@/context";
import { text } from "@clack/prompts";
import { pathFromInput } from "./utils";
import { existsSync } from "node:fs";

const DEFAULT_PROJECT_FOLDER = "./spectacular-honc";

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

function getRandomProjectFolder() {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const number = Math.floor(Math.random() * 90) + 10;
  return `./${adjective}-${animal}-${number?.toString()?.slice(0, 2)}`;
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

export async function promptProjectFolder(ctx: Context) {
  try {
    const placeholder = getPlaceholder();
    const result = await text({
      message: "Where should we create your spec? (./relative-path)",
      placeholder,
      defaultValue: placeholder,
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
