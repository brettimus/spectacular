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
    // Add inspection to debug actor lifecycle
    inspect: (event) => {
      if (event.type === '@xstate.actor') {
        console.log('Actor lifecycle event:', event);
      }
    }
  });
  private loadingSpinner: ReturnType<typeof spinner> | null = null;

  constructor() {
    // Listen for state changes to provide UI feedback
    this.actor.subscribe((snapshot) => {
      const currentState = typeof snapshot.value === 'string' 
        ? snapshot.value 
        : Object.keys(snapshot.value)[0];
      
      console.log(`State transition to -> ${currentState}`);
      
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
          // Log children to debug
          console.log("Available children actors:", 
            Object.keys(this.actor.getSnapshot().children));
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
        // Wait briefly for the stream actor to be initialized
        await new Promise(resolve => setTimeout(resolve, 50));
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
    console.log("Children keys:", Object.keys(children));
    
    // Get the first child actor which should be the stream actor
    // Based on the logs, we need to look for an actor with ID containing 'yieldingQuestionStream'
    let textStreamActorRef: AnyActorRef | undefined;
    
    // Find an actor with 'yieldingQuestionStream' in its ID
    const childKeys = Object.keys(children);
    for (const key of childKeys) {
      if (key.includes('yieldingQuestionStream')) {
        console.log(`Found stream actor with key: ${key}`);
        textStreamActorRef = children[key] as AnyActorRef;
        break;
      }
    }
    
    if (!textStreamActorRef && childKeys.length > 0) {
      // If we didn't find it by name but there's at least one child, use the first one
      console.log("Using first available child actor as fallback");
      textStreamActorRef = children[childKeys[0]] as AnyActorRef;
    }
    
    if (!textStreamActorRef) {
      log.error("No text stream actor found");
      return;
    }
    
    console.log("TextStreamActor state:", textStreamActorRef.getSnapshot());
    
    // Create an array to collect chunks
    const allChunks: string[] = [];
    let hasFirstChunkBeenProcessed = false;
    
    // Set up a subscription to collect chunks as they come in
    const subscription = textStreamActorRef.subscribe((snapshot) => {
      console.log("Stream actor snapshot received");
      
      if ('context' in snapshot && snapshot.context && 'chunks' in snapshot.context) {
        const snapshotChunks = snapshot.context.chunks as string[];
        console.log(`Received chunks update: ${snapshotChunks.length} chunks total`);
        
        // Only process new chunks
        if (snapshotChunks.length > allChunks.length) {
          // Add new chunks to our collection
          for (let i = allChunks.length; i < snapshotChunks.length; i++) {
            console.log(`Adding new chunk: "${snapshotChunks[i]}"`);
            allChunks.push(snapshotChunks[i]);
          }
        }
      } else {
        console.log("Snapshot does not contain chunks array:", snapshot);
      }
    });
    
    // Show a fake response if we're not getting real chunks
    if (allChunks.length === 0) {
      // Let's add a fake chunk to make sure the UI is responsive
      console.log("Adding placeholder text while waiting for real chunks");
      setTimeout(() => {
        allChunks.push("Loading response...");
      }, 500);
    }
    
    // Stream the content using Clack's async generator
    await stream.info(
      (async function* () {
        let previousLength = 0;
        let attemptCount = 0;
        const maxAttempts = 100; // 10 seconds max wait
        
        while (attemptCount < maxAttempts) {
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
            console.log("Current actor state:", state);
            
            if ('value' in state) {
              const value = state.value;
              const stateValue = typeof value === 'string' ? value : Object.keys(value)[0];
              if (stateValue === 'complete' || stateValue === 'failed') {
                console.log("Stream actor completed with state:", stateValue);
                break;
              }
            }
          } catch (error) {
            console.error("Error checking stream state:", error);
            break;
          }
          
          // Small delay to prevent CPU spinning
          await new Promise(resolve => setTimeout(resolve, 100));
          attemptCount++;
          
          // If we've been waiting a while with no chunks, add a hint
          if (attemptCount === 20 && allChunks.length === 0) {
            console.log("No chunks received after 2 seconds, adding hint");
            allChunks.push("I'm thinking about how to respond...");
          }
        }
        
        // If we timed out with no real response, add a message
        if (attemptCount >= maxAttempts && allChunks.length <= 1) {
          yield "\n  Sorry, I'm having trouble generating a response. Please try again.";
        }
        
        // Clean up
        subscription.unsubscribe();
      })()
    );
    
    // Make sure we get at least some minimal UI feedback
    if (allChunks.length === 0) {
      log.info("No response chunks were received from the actor.");
    }
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