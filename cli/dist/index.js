#!/usr/bin/env node

// src/index.ts
import { config } from "dotenv";
import { intro, isCancel as isCancel2, outro } from "@clack/prompts";
import pico3 from "picocolors";

// src/description.ts
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
var HATCH_LOG_LEVEL = process?.env?.HATCH_LOG_LEVEL ?? "info";

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
    if (HATCH_LOG_LEVEL === "debug") {
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
import { isCancel, log as log2, spinner, stream, text as text2 } from "@clack/prompts";
import { appendResponseMessages } from "ai";
import pico2 from "picocolors";

// src/integrations/agent.ts
import { openai } from "@ai-sdk/openai";
import { generateObject, streamText } from "ai";
import { z } from "zod";
async function routerAgent(ctx) {
  const model = openai("gpt-4o-mini");
  const { object: classification } = await generateObject({
    model,
    schema: z.object({
      reasoning: z.string().describe("A brief explanation of your reasoning for the classification."),
      nextStep: z.enum(["ask_follow_up_question", "generate_implementation_plan"])
    }),
    messages: ctx.messages,
    system: `
    You are an expert AI assistant that helps iterate on coding ideas in order to inform an _eventual_ software specification to implement a software project.

    The user has approached you with an idea for a software project.

    Look at the conversation history and determine what we need to do next.

    Either we have sufficient information to generate an implementation plan, or we need to ask the user a follow-up question.

    Consider the user's intent, as well as the following checklist:

    - Do we have a clear idea of the domain of the project?
    - Do we have an idea of features like auth, email, etc?
    `
  });
  return {
    nextStep: classification.nextStep
  };
}
var IDEATING_SYSTEM_PROMPT = `
You are an expert AI assistant that helps iterate on coding ideas in order to inform an _eventual_ software specification to implement a software project.

You are only develop data APIs. YOU DO NOT DEVELOP UI.

The user will approach you with an idea for a software project.

Ask the user one question at a time so we can develop a thorough, step-by-step spec for this idea. Each question should build on previous answers,
and our end goal is to have a detailed specification that the user can hand off to a developer. 
Let's do this iteratively and dig into every relevant detail.

Be sure to determine if the project needs:

- User Authentication
- Email
- Relational Database
- File Storage

Remember, only one question at a time.

Here's the idea:
`;
async function askFollowUpQuestion(ctx) {
  return streamText({
    model: openai("gpt-4o"),
    system: IDEATING_SYSTEM_PROMPT,
    messages: ctx.messages
  });
}
var IMPLEMENTATION_PLAN_SYSTEM_PROMPT = `
You are an expert AI assistant that helps iterate on coding ideas in order to inform a software specification to implement a software project.

The user has approached you with an idea for a software project.

You have already asked the user a series of questions to develop a thorough, step-by-step spec for this idea.

Now, you need to generate an implementation plan for the user's idea.

The implementation plan should read like a handoff document for a developer.

It should be detailed and include all the information needed to implement the project.

Certain technology choices are already made:

- Hono for the API
- Cloudflare Workers for the runtime

This is important to my career.
`;
async function generateImplementationPlan(ctx) {
  return generateObject({
    model: openai("o3-mini"),
    system: IMPLEMENTATION_PLAN_SYSTEM_PROMPT,
    messages: ctx.messages,
    mode: "json",
    schema: z.object({
      title: z.string().describe("A title for the project."),
      plan: z.string().describe("A detailed implementation plan / handoff document for a developer to implement the project (in markdown).")
    })
  });
}

// src/actions/ideate.ts
async function actionIdeate(ctx) {
  const description = ctx.description;
  if (!description) {
    log2.error("Description is required");
    process.exit(1);
  }
  ctx.messages.push(createUserMessage(description));
  const s = spinner();
  s.start("Getting ready to speculate...");
  let routerResponse = await routerAgent(ctx);
  let nextStep = routerResponse.nextStep;
  while (nextStep === "ask_follow_up_question") {
    log2.info("Asking follow up question");
    await streamFollowUpQuestion(ctx, s);
    await promptUserAnswer(ctx);
    routerResponse = await routerAgent(ctx);
    nextStep = routerResponse.nextStep;
  }
  const secondSpinner = spinner();
  secondSpinner.start("Generating a spectacular plan...");
  const implementationPlan = await generateImplementationPlan(ctx);
  ctx.specName = implementationPlan.object.title;
  ctx.specContent = implementationPlan.object.plan;
  secondSpinner.stop(pico2.italic("voil\xE0! a plan!"));
  return;
}
async function promptUserAnswer(ctx) {
  const userAnswer = await text2({
    message: pico2.italic("Your response:"),
    defaultValue: "",
    validate: (value) => {
      if (value === "") {
        return pico2.italic("Give me something to work with here!");
      }
      return void 0;
    }
  });
  if (isCancel(userAnswer)) {
    handleCancel();
  }
  if (isError(userAnswer)) {
    handleError(userAnswer);
  }
  ctx.messages.push(createUserMessage(userAnswer));
}
async function streamFollowUpQuestion(ctx, spinner2) {
  const followUpQuestionStream = await askFollowUpQuestion(ctx);
  await stream.info(async function* () {
    let hasStarted = false;
    for await (const chunk of followUpQuestionStream.textStream) {
      if (!hasStarted) {
        hasStarted = true;
        spinner2.stop(pico2.italic("Spectacular:"));
        log2.info("");
        yield `  ${chunk}`;
      } else {
        yield chunk;
      }
    }
  }());
  const response = await followUpQuestionStream.response;
  ctx.messages = appendResponseMessages({
    messages: ctx.messages,
    responseMessages: response.messages
  });
}
function createUserMessage(content) {
  return {
    id: randomMessageId(),
    content,
    role: "user",
    parts: [{
      type: "text",
      text: content
    }]
  };
}
function randomMessageId() {
  return Math.random().toString(36).substring(2);
}

// src/actions/save-brainstorm.ts
import { text as text3 } from "@clack/prompts";
import { writeFileSync } from "node:fs";
import path from "node:path";
async function actionSaveBrainstorm(ctx) {
  try {
    const placeholder = ctx.specName ?? "./brainstorm.md";
    const result = await text3({
      message: "Where should we save your brainstorm? (./relative-path)",
      placeholder,
      defaultValue: placeholder
    });
    if (typeof result === "string") {
      if (result === "") {
        ctx.path = placeholder;
      } else {
        const dirname = path.dirname(result);
        if (dirname === "." && !result.startsWith("./") && !result.startsWith("../")) {
          ctx.path = path.join(ctx.cwd, result);
        } else {
          ctx.path = result;
        }
      }
    }
    if (!ctx.path) {
      throw new Error("Path is required");
    }
    if (!ctx.brainstorm) {
      throw new Error("Brainstorm is required");
    }
    writeFileSync(ctx.path, ctx.brainstorm);
    return result;
  } catch (error) {
    return error;
  }
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
  if (isCancel2(descriptionResult)) {
    handleCancel();
  }
  if (descriptionResult instanceof Error) {
    handleError(descriptionResult);
  }
  const result = await actionIdeate(context);
  if (isCancel2(result)) {
    handleCancel();
  }
  if (isError(result)) {
    handleError(result);
  }
  const saveBrainstormResult = await actionSaveBrainstorm(context);
  if (isCancel2(saveBrainstormResult)) {
    handleCancel();
  }
  if (saveBrainstormResult instanceof Error) {
    handleError(saveBrainstormResult);
  }
  outro(`\u{1F989} saved spec in ${context.specPath}!
`);
  process.exit(0);
}
main().catch((err) => {
  console.error("Unhandled error:", err);
});
