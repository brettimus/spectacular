import type { Context } from "@/context";
import {
  askFollowUpQuestion,
  generateImplementationPlan,
  routerAgent,
} from "@/integrations/agent";
import { isError } from "@/types";
import { handleCancel, handleError } from "@/utils";
import { stream, isCancel, log, spinner, text } from "@clack/prompts";
import { type Message, appendResponseMessages } from "ai";
import pico from "picocolors";

type Spinner = ReturnType<typeof spinner>;

// https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/
export const IDEATING_SYSTEM_PROMPT = `
You are an expert AI assistant that helps iterate on coding ideas in order to inform an _eventual_ software specification to implement a software project.

The user will approach you with an idea for a software project.

Ask the user one question at a time so we can develop a thorough, step-by-step spec for this idea. Each question should build on previous answers,
and our end goal is to have a detailed specification that the user can hand off to a developer. 
Let's do this iteratively and dig into every relevant detail.

Remember, only one question at a time.

All your responses should also contain a message to the user, even when you're also doing tool use.

Here's the idea:
`;

export async function actionIdeate(ctx: Context) {
  const description = ctx.description;

  // This shouldn't happen, i just want to appease typescript
  if (!description) {
    log.error("Description is required");
    process.exit(1);
  }

  // Fudge the first message from the user
  ctx.messages.push(createUserMessage(description));

  const s = spinner();
  s.start("Getting ready to speculate...");

  let routerResponse = await routerAgent(ctx);
  let nextStep = routerResponse.nextStep;

  while (nextStep === "ask_follow_up_question") {
    log.info("Asking follow up question");
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

  secondSpinner.stop(pico.italic("voilà! a plan!"));
  return;
}

async function promptUserAnswer(ctx: Context) {
  const userAnswer = await text({
    message: pico.italic("Your response:"),
    defaultValue: "",
    validate: (value) => {
      if (value === "") {
        return pico.italic("Give me something to work with here!");
      }
      return undefined;
    },
  });

  if (isCancel(userAnswer)) {
    handleCancel();
  }

  if (isError(userAnswer)) {
    handleError(userAnswer);
  }

  ctx.messages.push(createUserMessage(userAnswer as string));
}

async function streamFollowUpQuestion(ctx: Context, spinner: Spinner) {
  const followUpQuestionStream = await askFollowUpQuestion(ctx);

  await stream.info(
    (async function* () {
      let hasStarted = false;
      // Yield content from the AI SDK stream
      for await (const chunk of followUpQuestionStream.textStream) {
        if (!hasStarted) {
          hasStarted = true;
          spinner.stop(pico.italic("Spectacular:"));
          log.info("");
          yield `  ${chunk}`;
        } else {
          yield chunk;
        }
      }
    })(),
  );

  const response = await followUpQuestionStream.response;

  ctx.messages = appendResponseMessages({
    messages: ctx.messages,
    responseMessages: response.messages,
  });
}

function createUserMessage(content: string): Message {
  return {
    id: randomMessageId(),
    content,
    role: "user",
    parts: [
      {
        type: "text",
        text: content,
      },
    ],
  };
}

function randomMessageId(): string {
  return Math.random().toString(36).substring(2);
}
