import {
  createActor,
  type SnapshotFrom,
  waitFor,
  type ActorRefFrom,
} from "xstate";
import { spinner, text, log, stream, isCancel } from "@clack/prompts";
import pico from "picocolors";
import type { Message } from "ai";
import { spectacularMachine } from "../spectacular";
import type { AiTextStreamResult } from "../machines/streaming";
import type {
  chatMachine,
  ChatMachineContext,
} from "../machines/chat";

export class SpectacularCliAdapter {
  // private actor: ActorRefFrom<typeof chatMachine>;
  private actor: ActorRefFrom<typeof spectacularMachine>;
  private loadingSpinner: ReturnType<typeof spinner> | null = null;

  constructor() {
    this.actor = createActor(spectacularMachine, {
      input: {
        apiKey: "123",
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
      // Get the current state value
      const currentState =
        typeof snapshot.value === "string"
          ? snapshot.value
          : Object.keys(snapshot.value)[0];

      console.log(`State transition to -> ${currentState}`);
      // console.log("Current state:", currentState);

      // Handle different states with appropriate UI feedback
      switch (currentState) {
        case "Idle":
          console.log("Idle state stopping spinner");
          this.stopSpinner();
          break;
        case "Ideating": {
          // Check if the ideation actor is available
          const ideationActor = snapshot.children.ideation;
          if (ideationActor) {
            (ideationActor as ActorRefFrom<typeof chatMachine>).subscribe(
              this.ideationSubscription.bind(this),
            );
            const ideationSnapshot = ideationActor.getSnapshot();
            // Check the child actor's state to update UI accordingly
            const childState = ideationSnapshot.value;
            console.log("childState", childState);
            if (childState === "Routing") {
              this.startSpinner("Thinking...");
            } else if (childState === "FollowingUp") {
              this.updateSpinner("Preparing follow-up question...");
            } else if (childState === "GeneratingSpec") {
              this.updateSpinner("Generating implementation plan...");
            } else if (childState === "SavingSpec") {
              this.updateSpinner("Saving plan to disk...");
            }
          } else {
            this.startSpinner("Starting ideation process...");
          }

          // Check if there's a streaming response available
          const streamResponse = (
            snapshot.children.ideation?.getSnapshot()
              ?.context as ChatMachineContext
          )?.streamResponse;
          if (streamResponse) {
            if (this.loadingSpinner) {
              this.stopSpinner("Question:");
            }
            this.streamQuestion(streamResponse);
          }
          break;
        }
        case "GeneratingSchema":
          this.updateSpinner("Generating database schema...");
          break;
        case "GeneratingApi":
          this.updateSpinner("Generating API code...");
          break;
        case "Done":
          if (this.loadingSpinner) {
            this.stopSpinner("Complete!");
          }
          // if (snapshot.context.specLocation) {
          //   log.success(`Plan saved to: ${snapshot.context.specLocation}`);
          // }
          log.success("Plan saved somewhere");

          break;
      }
    });
  }

  public ideationSubscription(snapshot: SnapshotFrom<typeof chatMachine>) {
    // console.log("Snapshot received:", snapshot);
    const currentState =
      typeof snapshot.value === "string"
        ? snapshot.value
        : Object.keys(snapshot.value)[0];

    // console.log(`State transition to -> ${currentState}`);

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
      case "GeneratingSpec":
        this.updateSpinner("Generating implementation plan...");
        break;
      case "SavingSpec":
        this.updateSpinner("Saving spec to disk...");
        break;
      case "Done":
        if (this.loadingSpinner) {
          this.stopSpinner("Complete!");
        }
        log.success(`Spec saved to: ${snapshot.context.specLocation}`);
        break;
    }
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

      const ideationActor = this.actor.getSnapshot().children?.ideation;

      if (!ideationActor) {
        log.error("No ideation actor found");
        break;
      }

      // Wait for the machine to return to idle or reach done state
      // HACK - Coerce type to chatMachine to avoid type errors
      await waitFor(
        ideationActor as ActorRefFrom<typeof chatMachine>,
        (state) => {
          const isAwaitingUserInput = state.matches("AwaitingUserInput");
          const isDone = state.matches("Done");
          // console.log("isAwaitingUserInput", isAwaitingUserInput);
          // console.log("isDone", isDone);
          return isAwaitingUserInput || isDone;
        },
      );

      userPrompt = null;
    }
  }

  private async streamQuestion(result: AiTextStreamResult) {
    await stream.info(
      (async function* () {
        // Yield content from the AI SDK stream
        for await (const chunk of result.textStream) {
          yield chunk;
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
