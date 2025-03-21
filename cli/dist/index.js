#!/usr/bin/env node

// src/index.ts
import { config } from "dotenv";
import { intro, isCancel, outro } from "@clack/prompts";
import pico3 from "picocolors";

// src/actions/description.ts
import { text } from "@clack/prompts";
import pico from "picocolors";
async function promptDescription(ctx) {
  try {
    const placeholder = "Describe your api...";
    const result = await text({
      message: "Let's build an api.",
      placeholder,
      defaultValue: "",
      validate: (value) => {
        if (value === "") {
          return pico.italic("Give me something to work with here!");
        }
        return void 0;
      }
    });
    if (typeof result === "string") {
      if (result !== "") {
        ctx.description = result;
      }
    }
    return result;
  } catch (error) {
    return error;
  }
}

// src/const.ts
var SPECTACULAR_TITLE = `
   /)_/)
  (0v0)
  (( ))
   ^-^
`;
var CANCEL_MESSAGE = " oop, buhbye \u{1F44B}";

// src/utils.ts
import { cancel, log } from "@clack/prompts";

// src/types.ts
var CodeGenError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "CodeGenError";
  }
};
var isError = (error) => {
  return error instanceof Error || error instanceof CodeGenError;
};

// src/utils.ts
function getPackageManager() {
  return process.env.npm_config_user_agent?.split("/").at(0);
}
function handleError(error) {
  if (error instanceof CodeGenError) {
    log.warn(
      `Could not scaffold project according to your description
(error: ${error.message})`
    );
    log.info("Continuing...");
  } else {
    log.error(`exiting with an error: ${error.message}`);
    if (process?.env?.CHA_LOG_LEVEL === "debug") {
      console.error("\n\n*********LOGGING VERBOSE ERROR*********\n");
      console.error(error);
      console.error(
        "\n\n*********LOGGING VERBOSE ERROR AGAIN, BUT AS JSON*********\n"
      );
      console.error(JSON.stringify(error, null, 2));
    }
    process.exit(1);
  }
}
function handleCancel() {
  cancel(CANCEL_MESSAGE);
  process.exit(0);
}

// src/context.ts
function initContext() {
  return {
    cwd: process.cwd(),
    packageManager: getPackageManager() ?? "npm",
    messages: [],
    // TODO - Improve this random id and concatenate with project name somehow
    sessionId: Math.random().toString(36).substring(2),
    codeGenApiKey: process.env.HATCH_API_KEY,
    codeGenBaseUrl: process.env.HATCH_BASE_URL,
    codeGenPromise: Promise.resolve(null)
  };
}

// src/actions/ideate.ts
import { log as log2, spinner, stream } from "@clack/prompts";
import { appendResponseMessages, streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import pico2 from "picocolors";
var IDEATING_SYSTEM_PROMPT = `
You are an expert AI assistant that helps iterate on coding ideas in order to inform an _eventual_ software specification to implement a software project.

The user will approach you with an idea for a software project.

Ask the user one question at a time so we can develop a thorough, step-by-step spec for this idea. Each question should build on previous answers,
and our end goal is to have a detailed specification that the user can hand off to a developer. 
Let's do this iteratively and dig into every relevant detail.

Remember, only one question at a time.

Here's the idea:
`;
async function actionIdeate(ctx) {
  const description = ctx.description;
  if (!description) {
    log2.error("Description is required");
    process.exit(1);
  }
  const s = spinner();
  s.start("Getting ready to ideate...");
  ctx.messages.push({
    id: randomMessageId(),
    content: description,
    role: "user",
    parts: [{
      type: "text",
      text: description
    }]
  });
  const streamResponse = streamText({
    model: openai("gpt-4o-mini"),
    system: IDEATING_SYSTEM_PROMPT,
    messages: ctx.messages
  });
  await stream.info(async function* () {
    let hasStarted = false;
    for await (const chunk of streamResponse.textStream) {
      if (!hasStarted) {
        hasStarted = true;
        s.stop(pico2.italic("\xE1ndale"));
        log2.info("");
        yield `  ${chunk}`;
      } else {
        yield chunk;
      }
    }
  }());
  const response = await streamResponse.response;
  ctx.messages = appendResponseMessages({
    messages: ctx.messages,
    responseMessages: response.messages
  });
  return;
}
function randomMessageId() {
  return Math.random().toString(36).substring(2);
}

// src/index.ts
config();
async function main() {
  console.log("");
  console.log(pico3.magentaBright(pico3.bold(SPECTACULAR_TITLE)));
  console.log("");
  intro("\u{1F62E} spectacular");
  const context = initContext();
  const descriptionResult = await promptDescription(context);
  if (isCancel(descriptionResult)) {
    handleCancel();
  }
  if (descriptionResult instanceof Error) {
    handleError(descriptionResult);
  }
  const result = await actionIdeate(context);
  if (isCancel(result)) {
    handleCancel();
  }
  if (isError(result)) {
    handleError(result);
  }
  outro(`\u{1F989} saved brainstorm.md in ${context.path}!
`);
  process.exit(0);
}
main().catch((err) => {
  console.error("Unhandled error:", err);
});
