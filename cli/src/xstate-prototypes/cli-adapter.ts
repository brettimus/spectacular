import { createActor, waitFor, type AnyActorRef } from "xstate";
import { chatMachine } from "./chat/chat";
import { spinner, text, log, stream } from "@clack/prompts";
import pico from "picocolors";
import type { Message } from "ai";

export class ChatCliAdapter {
  private actor = createActor(chatMachine, {
    input: {
      cwd: process.cwd(),
    },
  });
  private loadingSpinner: ReturnType<typeof spinner> | null = null;

  constructor() {
    // Listen for state changes to provide UI feedback
    this.actor.subscribe((snapshot) => {
      const currentState = typeof snapshot.value === 'string' 
        ? snapshot.value 
        : Object.keys(snapshot.value)[0];
      
      // Handle different states with appropriate UI feedback
      switch (currentState) {
        case 'routing':
          this.startSpinner("Analyzing your request...");
          break;
        case 'followingUp':
          this.updateSpinner("Preparing follow-up question...");
          break;
        case 'yieldingQuestionStream':
          if (this.loadingSpinner) {
            this.stopSpinner("Question:");
          }
          break;
        case 'generatingPlan':
          this.updateSpinner("Generating implementation plan...");
          break;
        case 'savingPlan':
          this.updateSpinner("Saving plan to disk...");
          break;
        case 'done':
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
    
    // Main CLI loop
    while (true) {
      const userPrompt = await text({
        message: pico.italic("What would you like me to help with?"),
        placeholder: "Type your project idea or request...",
      });
      
      if (userPrompt === null || userPrompt === '') {
        log.info("Exiting chat session");
        break;
      }
      
      // Send prompt to state machine
      this.actor.send({
        type: "promptReceived",
        prompt: userPrompt as string,
      });
      
      // Wait for transition to yieldingQuestionStream if needed
      const snapshot = await waitFor(this.actor, (state) => {
        const value = state.value;
        const stateValue = typeof value === 'string' ? value : Object.keys(value)[0];
        return stateValue === 'yieldingQuestionStream' || 
               stateValue === 'generatingPlan' || 
               stateValue === 'done';
      });
      
      // Check current state
      const currentValue = snapshot.value;
      const stateValue = typeof currentValue === 'string' ? currentValue : Object.keys(currentValue)[0];
      
      // If we're streaming a question, handle the streaming
      if (stateValue === 'yieldingQuestionStream') {
        await this.streamQuestion();
        
        // After streaming, prompt for user clarification
        await this.promptUserClarification();
      } else if (stateValue !== 'done') {
        // Wait for the machine to reach done or idle state
        await waitFor(this.actor, (state) => {
          const value = state.value;
          const stateValue = typeof value === 'string' ? value : Object.keys(value)[0];
          return stateValue === 'done' || stateValue === 'idle';
        });
      }
      
      // Show a separator for the next interaction
      log.info("");
      log.info(pico.dim("---"));
    }
  }

  private async streamQuestion() {
    // Subscribe to the text stream actor to get updates when chunks arrive
    const children = this.actor.getSnapshot().children;
    const textStreamActorRef = children.processQuestionStream as AnyActorRef | undefined;
    
    if (!textStreamActorRef) {
      log.error("No text stream actor found");
      return;
    }
    
    // Create an array to collect chunks
    const allChunks: string[] = [];
    let hasFirstChunkBeenProcessed = false;
    
    // Set up a subscription to collect chunks as they come in
    const subscription = textStreamActorRef.subscribe((snapshot) => {
      if ('context' in snapshot && snapshot.context && 'chunks' in snapshot.context) {
        const snapshotChunks = snapshot.context.chunks as string[];
        
        // Only process new chunks
        if (snapshotChunks.length > allChunks.length) {
          // Add new chunks to our collection
          for (let i = allChunks.length; i < snapshotChunks.length; i++) {
            allChunks.push(snapshotChunks[i]);
          }
        }
      }
    });
    
    // Stream the content using Clack's async generator
    await stream.info(
      (async function* () {
        let previousLength = 0;
        
        while (true) {
          // Check if we have new chunks
          if (allChunks.length > previousLength) {
            // Process only the new chunks
            for (let i = previousLength; i < allChunks.length; i++) {
              const chunk = allChunks[i];
              
              // First chunk gets special formatting
              if (i === 0 && !hasFirstChunkBeenProcessed) {
                hasFirstChunkBeenProcessed = true;
                yield `  ${chunk}`;
              } else {
                yield chunk;
              }
            }
            
            // Update our position
            previousLength = allChunks.length;
          }
          
          // Check if the streaming is complete
          try {
            const state = textStreamActorRef.getSnapshot();
            if ('value' in state) {
              const value = state.value;
              const stateValue = typeof value === 'string' ? value : Object.keys(value)[0];
              if (stateValue === 'complete' || stateValue === 'failed') {
                break;
              }
            }
          } catch (error) {
            console.error("Error checking stream state:", error);
            break;
          }
          
          // Small delay to prevent CPU spinning
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        // Clean up
        subscription.unsubscribe();
      })()
    );
  }

  private async promptUserClarification() {
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
    
    if (userAnswer === null) {
      log.error("User cancelled input");
      return;
    }
    
    // Send the user's answer as a new prompt
    this.actor.send({
      type: "promptReceived",
      prompt: userAnswer as string,
    });
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

  private stopSpinner(message: string): void {
    if (this.loadingSpinner) {
      this.loadingSpinner.stop(pico.italic(message));
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