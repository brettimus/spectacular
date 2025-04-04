import { createActor, waitFor, type ActorRefFrom } from "xstate";
import { spinner, text, log, stream, isCancel } from "@clack/prompts";
import pico from "picocolors";
import type { Message } from "ai";
import { config } from "dotenv";
import { chatMachine } from "@/xstate-prototypes/machines/chat";
import type { AiTextStreamResult } from "@/xstate-prototypes/machines/streaming";

config();

const API_KEY = process.env.OPENAI_API_KEY;
const AI_PROVIDER = "openai";

export class ChatCliAdapter {
  private actor: ActorRefFrom<typeof chatMachine>;
  private loadingSpinner: ReturnType<typeof spinner> | null = null;

  constructor() {
    // TODO - Look up API key from config dir
    if (!API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    // TODO - Try to provide a `processQuestionStream` actor that can
    //        stream the response to the CLI
    this.actor = createActor(chatMachine, {
      input: {
        apiKey: API_KEY,
        aiProvider: AI_PROVIDER,
        cwd: process.cwd(),
      },
      // Add inspection to debug actor lifecycle
      inspect: (event) => {
        if (event.type === "@xstate.actor") {
          // console.log('Actor lifecycle event:', event);
        }
      },
    });
    // Listen for state changes to provide UI feedback
    this.actor.subscribe((snapshot) => {
      // console.log("Snapshot received:", snapshot);
      const currentState =
        typeof snapshot.value === "string"
          ? snapshot.value
          : Object.keys(snapshot.value)[0];

      console.log(`State transition to -> ${currentState}`);

      // Handle different states with appropriate UI feedback
      switch (currentState) {
        case "Idle":
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
        case "GeneratingPlan":
          this.updateSpinner("Generating implementation plan...");
          break;
        case "SavingPlan":
          this.updateSpinner("Saving plan to disk...");
          break;
        case "Done":
          if (this.loadingSpinner) {
            this.stopSpinner("Complete!");
          }
          log.success(`Plan saved to: ${snapshot.context.specLocation}`);
          break;
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
        prompt: userPrompt as string,
      });

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
