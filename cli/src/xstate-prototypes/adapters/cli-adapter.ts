import { createActor, waitFor, type ActorRefFrom } from "xstate";
import { chatMachine } from "../chat/chat";
import { spinner, text, log, stream, isCancel } from "@clack/prompts";
import pico from "picocolors";
import type { Message } from "ai";
import type { QuestionTextStreamResult } from "../streaming/types";

export class ChatCliAdapter {
  private actor: ActorRefFrom<typeof chatMachine>;
  private loadingSpinner: ReturnType<typeof spinner> | null = null;

  constructor() {
    // TODO - Try to provide a `processQuestionStream` actor that can
    //        stream the response to the CLI
    this.actor = createActor(chatMachine, {
      input: {
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

      // console.log(`State transition to -> ${currentState}`);

      // Handle different states with appropriate UI feedback
      switch (currentState) {
        case "idle":
          this.stopSpinner();
          break;
        case "routing":
          this.startSpinner("Thinking...");
          break;
        case "followingUp":
          this.updateSpinner("Preparing follow-up question...");
          break;
        case "yieldingQuestionStream":
          if (this.loadingSpinner) {
            this.stopSpinner("Question:");
          }
          this.streamQuestion(
            snapshot.context.streamResponse as QuestionTextStreamResult,
          );
          break;
        case "generatingPlan":
          this.updateSpinner("Generating implementation plan...");
          break;
        case "savingPlan":
          this.updateSpinner("Saving plan to disk...");
          break;
        case "done":
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
        type: "promptReceived",
        prompt: userPrompt as string,
      });

      await waitFor(
        this.actor,
        (state) => {
          const shouldContinue = state.matches("done") || state.matches("idle");
          return shouldContinue;
        },
        // { timeout: 20000 },
      );

      userPrompt = null;
    }
  }

  private async streamQuestion(result: QuestionTextStreamResult) {
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
