import type { AiTextStreamResult } from "@/xstate-prototypes/machines/streaming";
import { stream, isCancel, log, spinner, text } from "@clack/prompts";
import type { Message } from "ai";
import { config } from "dotenv";
import pico from "picocolors";
import {
  type ActorRefFrom,
  type StateFrom,
  createActor,
  waitFor,
} from "xstate";
import { chatMachine } from "../../machines";
import {
  actionCreateProjectFolder,
  promptProjectFolder,
} from "./prompt-project-dir";
import { createCliChatMachine } from "./machines";

// import path from "node:path";

config();

const API_KEY = process.env.OPENAI_API_KEY;
// TODO - Look up API key from config dir

if (!API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

const AI_PROVIDER = "openai";

type ChatCliAdapterState = StateFrom<typeof chatMachine>["value"];

export class ChatCliAdapter {
  projectDir: string | undefined;
  machine: typeof chatMachine;
  actor: ActorRefFrom<typeof chatMachine>;

  private loadingSpinner: ReturnType<typeof spinner> | null = null;

  private previousState: ChatCliAdapterState | null = null;

  constructor(baseChatMachine = chatMachine) {
    this.previousState = null;
    this.machine = baseChatMachine;

    // NOTE - We need to provide filesystem actors to do things like save the spec and files to disk

    // TODO - Try to provide a `processQuestionStream` actor that can
    //        stream the response to the CLI

    // Temporary actor - gets reset when we start the cli and ask for the project dir
    this.actor = createActor(this.machine, {
      input: {
        apiKey: API_KEY ?? "",
        aiProvider: AI_PROVIDER,
      },
    });
  }

  // Start the chat session
  // biome-ignore lint/complexity/noBannedTypes: prototyping!! get off my back!!!!
    public async start(callback?: Function): Promise<void> {
    // We have to start by forcing the user to select a project directory
    const projectDir = await promptProjectFolder(process.cwd());
    if (!projectDir) {
      log.error("Could not set up project dir");
      process.exit(1);
    }

    this.projectDir = projectDir;

    await actionCreateProjectFolder(projectDir);

    // Important! Assign an actor that's scoped to the project directory
    // Also, we inject `this.machine` to support local chat
    const cliMachine = createCliChatMachine(projectDir, this.machine);
    this.actor = createActor(cliMachine, {
      input: {
        apiKey: API_KEY ?? "",
        aiProvider: AI_PROVIDER,
      },
    });

    let shouldChat = true;

    // Listen for state changes to provide UI feedback
    // HACK - We only execute the bulk of our logic when the state value changes
    //
    this.actor.subscribe({
      complete: () => {
        console.debug("Finished!", this.actor.getSnapshot().context);
        shouldChat = false;
        callback?.(null, this.actor.getSnapshot());
      },
      error(err) {
        console.error("Ended in error state?", err);
        shouldChat = false;
        callback?.(err, null);
      },
    });
    this.actor.subscribe((snapshot) => {
      const currentState: ChatCliAdapterState = snapshot.value;

      if (currentState !== this.previousState) {
        // console.log(pico.dim(`\nState transition to -> ${currentState}\n`));

        // Handle different states with appropriate UI feedback
        switch (currentState) {
          case "AwaitingUserInput":
            this.stopSpinner();
            break;
          case "Routing":
            this.startSpinner("Thinking...");
            break;
          case "InitializingFollowUpQuestion":
            this.updateSpinner("Preparing follow-up question...");
            break;
          case "StreamingFollowUpQuestion":
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
          case "Done": {
            if (this.loadingSpinner) {
              this.stopSpinner("Complete!");
            }
            const savedPath = snapshot.context.spec?.filename ?? "unknown";
            log.success(`Plan saved to: ${savedPath}`);
            // process.exit(0);
            break;
          }
          case "Error":
            if (this.loadingSpinner) {
              this.stopSpinner("Error!");
            }
            log.error("Whoa! Something went wrong...");
            console.error(
              "Error state reached:",
              JSON.stringify(snapshot.context, null, 2),
            );
            break;
        }

        this.previousState = currentState;
      }
    });

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
    while (shouldChat) {
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
        type: "user.message.added",
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
          if (isDone) {
            shouldChat = false;
          }
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
