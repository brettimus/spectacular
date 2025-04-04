import type { AiTextStreamResult } from "@/xstate-prototypes/machines/streaming";
import { stream, isCancel, log, spinner, text } from "@clack/prompts";
import type { Message } from "ai";
import { config } from "dotenv";
import pico from "picocolors";
import {
  type ActorRefFrom,
  createActor,
  type StateFrom,
  waitFor,
} from "xstate";
import { cliChatMachine } from "./machines";

config();

const API_KEY = process.env.OPENAI_API_KEY;
const AI_PROVIDER = "openai";

type ChatCliAdapterState = StateFrom<typeof cliChatMachine>["value"];

export class ChatCliAdapter {
  private actor: ActorRefFrom<typeof cliChatMachine>;
  private loadingSpinner: ReturnType<typeof spinner> | null = null;

  private previousState: ChatCliAdapterState | null = null;

  constructor() {
    // TODO - Look up API key from config dir
    if (!API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    this.previousState = null;
    // NOTE - We need to provide filesystem actors to do things like save the spec and files to disk

    // TODO - Try to provide a `processQuestionStream` actor that can
    //        stream the response to the CLI
    this.actor = createActor(cliChatMachine, {
      input: {
        apiKey: API_KEY,
        aiProvider: AI_PROVIDER,
        cwd: process.cwd(),
      },
    });

    // Listen for state changes to provide UI feedback
    // HACK - We only execute the bulk of our logic when the state value changes
    this.actor.subscribe((snapshot) => {
      const currentState: ChatCliAdapterState = snapshot.value;

      if (currentState !== this.previousState) {
        console.log(pico.dim(`\nState transition to -> ${currentState}\n`));
        // Handle different states with appropriate UI feedback
        switch (currentState) {
          case "AwaitingUserInput":
            this.stopSpinner();
            break;
          case "Routing":
            this.startSpinner("Thinking...");
            break;
          case "FollowingUp":
            this.updateSpinner("Preparing follow-up question...");
            break;
          case "ProcessingAiResponse":
            if (this.loadingSpinner) {
              this.stopSpinner("Question:");
            }
            this.streamQuestion(
              snapshot.context.streamResponse as AiTextStreamResult,
            );
            break;
          case "GeneratingSpec":
            this.updateSpinner("Generating implementation plan...");
            break;
          case "SavingSpec":
            this.updateSpinner("Saving plan to disk...");
            break;
          case "Done":
            if (this.loadingSpinner) {
              this.stopSpinner("Complete!");
            }
            log.success(`Plan saved to: ${snapshot.context.specLocation}`);
            process.exit(0);
            break;
          case "Error":
            if (this.loadingSpinner) {
              this.stopSpinner("Error!");
            }
            log.error("Whoa! Something went wrong...");
            break;
        }

        this.previousState = currentState;
      }
    });
  }

  // Start the chat session
  public async start(): Promise<void> {
    this.actor.start();
    log.info(pico.cyan("🤖 Spectacular AI Chat Session"));
    log.info(pico.dim("Type your question or idea to get started."));
    log.info("");

    let userPrompt: string | symbol | null = await text({
      message: pico.italic("What would you like me to help with?"),
      placeholder: "Type your project idea or request...",
      validate: (value) => {
        if (value === "") {
          return pico.italic("Give me something to work with here!");
        }
        return undefined;
      },
    });

    // Main CLI loop
    // TODO - Find a way to exit the loop with `done` ?
    while (true) {
      if (!userPrompt) {
        userPrompt = await text({
          message: pico.italic("Clarify..."),
          validate: (value) => {
            if (value === "") {
              return pico.italic("Give me something to work with here!");
            }
            return undefined;
          },
        });
      }

      if (isCancel(userPrompt)) {
        log.info("Exiting chat session");
        break;
      }

      // Send prompt to state machine
      this.actor.send({
        type: "user.message",
        content: userPrompt as string,
      });

      // This is a way to test cancellation!
      // await waitFor(
      //   this.actor,
      //   (state) => {
      //     const isRouting = state.matches("Routing");
      //     return isRouting;
      //   },
      // );

      // setTimeout(() => {
      //   this.actor.send({
      //     type: "cancel",
      //   });
      // }, 700);

      await waitFor(
        this.actor,
        (state) => {
          const isDone = state.matches("Done");
          const isAwaitingUserInput = state.matches("AwaitingUserInput");
          const shouldContinue = isAwaitingUserInput || isDone;
          return shouldContinue;
        },
        // { timeout: 20000 },
      );

      userPrompt = null;
    }
  }

  private async streamQuestion(result: AiTextStreamResult) {
    await stream.info(
      (async function* () {
        // let hasStarted = false;
        // Yield content from the AI SDK stream
        // NOTE - This uses a textStream instead of a dataStream,
        //        which means it will not receive information from tool calls.
        //        That's why the askFollowUpQuestion function does not have tool calls.
        for await (const chunk of result.textStream) {
          yield chunk;
          // HACK - Stop the spinner once we've started streaming the response
          // if (!hasStarted) {
          //   hasStarted = true;
          //   spinner.stop(pico.italic("Spectacular:"));
          //   log.info("");
          //   yield `  ${chunk}`;
          // } else {
          //   yield chunk;
          // }
        }
      })(),
    );
  }

  private startSpinner(message: string): void {
    if (this.loadingSpinner) {
      this.loadingSpinner.stop();
    }
    this.loadingSpinner = spinner();
    this.loadingSpinner.start(message);
  }

  private updateSpinner(message: string): void {
    if (this.loadingSpinner) {
      this.loadingSpinner.message(message);
    } else {
      this.startSpinner(message);
    }
  }

  private stopSpinner(message?: string): void {
    if (this.loadingSpinner) {
      this.loadingSpinner.stop(message ? pico.italic(message) : undefined);
      this.loadingSpinner = null;
    }
  }

  // Get the current chat history
  public getMessages(): Message[] {
    return this.actor.getSnapshot().context.messages;
  }
}

// Usage
export async function startCliChatSession() {
  const cli = new ChatCliAdapter();
  await cli.start();
}
