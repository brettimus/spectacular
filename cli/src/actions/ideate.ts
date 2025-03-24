import type { Context } from "@/context";
import {
  askFollowUpQuestion,
  generateImplementationPlan,
  routerAgent,
} from "@/integrations/ideation-agent";
import { createUserMessage } from "@/integrations/utils";
import { isError } from "@/types";
import { handleCancel, handleError } from "@/utils/utils";
import { stream, isCancel, log, spinner, text } from "@clack/prompts";
import { appendResponseMessages } from "ai";
import pico from "picocolors";

type Spinner = ReturnType<typeof spinner>;

export async function actionIdeate(ctx: Context) {
  const description = ctx.description;

  // This shouldn't happen, just want to appease typescript
  if (!description) {
    log.error("Description is required");
    process.exit(1);
  }

  // Fudge the first message from the user
  ctx.messages.push(createUserMessage(description));

  const followUpSpinner = spinner();
  followUpSpinner.start("Getting ready to speculate...");

  let routerResponse = await routerAgent(ctx);
  let nextStep = routerResponse.nextStep;

  while (nextStep === "ask_follow_up_question") {
    log.info("Asking follow up question");
    await streamFollowUpQuestion(ctx, followUpSpinner);
    await promptUserClarification(ctx);
    routerResponse = await routerAgent(ctx);
    nextStep = routerResponse.nextStep;
  }

  const implementationSpinner = spinner();
  implementationSpinner.start("Generating a spectacular plan...");

  const implementationPlan = await generateImplementationPlan(ctx);

  ctx.specName = implementationPlan.object.title;
  ctx.specContent = implementationPlan.object.plan;

  implementationSpinner.stop(pico.italic("voilà! a plan!"));
  return;
}

/**
 * Prompts the user for clarification on the last question.
 */
async function promptUserClarification(ctx: Context) {
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

/**
 * Streams a follow up question to the user.
 */
async function streamFollowUpQuestion(ctx: Context, spinner: Spinner) {
  const followUpQuestionStream = await askFollowUpQuestion(ctx);

  await stream.info(
    (async function* () {
      let hasStarted = false;
      // Yield content from the AI SDK stream
      // NOTE - This uses a textStream instead of a dataStream,
      //        which means it will not receive information from tool calls.
      //        That's why the askFollowUpQuestion function does not have tool calls.
      for await (const chunk of followUpQuestionStream.textStream) {
        // HACK - Stop the spinner once we've started streaming the response
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
