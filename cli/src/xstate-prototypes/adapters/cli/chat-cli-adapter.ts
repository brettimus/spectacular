import { fromPromise } from "xstate";
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
import { writeFile } from "node:fs/promises";
import { SaveSpecActorInput } from "@/xstate-prototypes/machines";
import {
  actionCreateProjectFolder,
  promptProjectFolder,
} from "./prompt-project-dir";

// import path from "node:path";

config();

const API_KEY = process.env.OPENAI_API_KEY;
const AI_PROVIDER = "openai";

type ChatCliAdapterState = StateFrom<typeof chatMachine>["value"];

export class ChatCliAdapter {
  private projectDir: string;
  private actor: ActorRefFrom<typeof chatMachine>;

  private loadingSpinner: ReturnType<typeof spinner> | null = null;

  private previousState: ChatCliAdapterState | null = null;

  constructor() {
    // TODO - Look up API key from config dir
    if (!API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    this.previousState = null;

    this.projectDir = process.cwd();

    // NOTE - We need to provide filesystem actors to do things like save the spec and files to disk

    // TODO - Try to provide a `processQuestionStream` actor that can
    //        stream the response to the CLI
    const machine = chatMachine.provide({
      actors: {
        saveSpec: fromPromise(this.saveSpecToDisk),
      },
    });
    this.actor = createActor(machine, {
      input: {
        apiKey: API_KEY,
        aiProvider: AI_PROVIDER,
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
            const savedPath = snapshot.context.spec?.filename ?? "unknown";
            log.success(`Plan saved to: ${savedPath}`);
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
    // We have to start by forcing the user to select a project directory
    const projectDir = await promptProjectFolder(process.cwd());
    if (!projectDir) {
      log.error("Could not set up project dir");
      process.exit(1);
    }

    await actionCreateProjectFolder(projectDir);

    // IMPORTANT! assign the project directory here so it can be used by actors
    this.projectDir = projectDir;

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

  private saveSpecToDisk = async ({ input }: { input: SaveSpecActorInput }) => {
    await writeFile(this.projectDir, input.content);
  };

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
