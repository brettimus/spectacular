# Spectacular CLI Machine Architecture

This directory contains a reimplementation of the Spectacular CLI using state machines and the actor model with XState 5.

## Architecture Overview

The implementation follows these core principles:

1. **Composable Workflows**: Each feature is modeled as a state machine that can be composed, tested, and run independently.
2. **Event-Driven**: Events like analytics, logging, and healing are standardized across the system.
3. **Testable**: Each workflow can be evaluated in isolation for testing and synthetic data generation.
4. **Extensible**: New workflows can be added without modifying existing code.

## Directory Structure

- `/core/` - Core types and base machine implementation
- `/workflows/` - Implementation of specific workflows like spec generation and schema generation
- `/commands/` - CLI command wrappers that utilize the state machines
- `/events/` - Event handling infrastructure for analytics, logging, and healing

## Key Concepts

### State Machines

Each workflow is implemented as a state machine with clearly defined states, transitions, and actions.

```typescript
// Creating a machine
const machine = createSpecGenerationMachine(cliContext);

// Creating an actor
const actor = createActor(machine);

// Starting the actor
actor.start();

// Sending events
actor.send({ type: "DESCRIBE_PROJECT" });

// Getting output
const result = await actor.getSnapshot().output;
```

### Event Handling

The system emits standardized events for analytics, logging, and healing operations:

```typescript
// Analytics events
sendAnalyticsEvent(cwd, "schema_generation_completed", {
  duration: 1200,
  success: true
});

// Logging events
sendLogEvent(cwd, "info", "Schema generation completed", {
  schemaPath: "/path/to/schema.ts"
});

// Healing events
sendHealingEvent(cwd, ["TypeError: Cannot read property..."], 
  "/path/to/schema.ts", "Fixed by adding type guard", true);
```

### Observing State Transitions

The actor model makes it easy to observe and react to state transitions in your workflows. This is useful for tracking analytics, updating UI, or debugging.

#### Basic State Observation

```typescript
const actor = createSchemaGenerationActor(ctx, specPath);
actor.start();

// Subscribe to all state changes
const subscription = actor.subscribe((state) => {
  console.log(`Current state: ${state.value}`);
  console.log(`Context:`, state.context);
  
  // Check for specific states
  if (state.matches("downloadingTemplate")) {
    console.log("Downloading template...");
  }
});

// Start the workflow
actor.send({ type: "START", specPath });

// Clean up when done
subscription.unsubscribe();
```

#### Tracking State Transitions for Analytics

```typescript
// Initialize tracking
const stateTimestamps = new Map();
const startTime = Date.now();

// Subscribe to state changes
const subscription = actor.subscribe((state) => {
  const currentTime = Date.now();
  
  // Record when we entered this state
  if (!stateTimestamps.has(state.value)) {
    stateTimestamps.set(state.value, currentTime);
    
    // Send analytics about entering a new state
    sendAnalyticsEvent(ctx.cwd, `entered_state_${state.value}`, {
      timeFromStart: currentTime - startTime
    });
  }
  
  // When the workflow is done, report on time spent in each state
  if (state.matches("done")) {
    const stateDurations = {};
    
    // Calculate time spent in each state
    for (const [stateName, timestamp] of stateTimestamps.entries()) {
      const nextState = findNextState(stateName);
      const nextStateTimestamp = nextState ? stateTimestamps.get(nextState) : currentTime;
      stateDurations[stateName] = nextStateTimestamp - timestamp;
    }
    
    // Send detailed analytics
    sendAnalyticsEvent(ctx.cwd, "workflow_completed", {
      totalDuration: currentTime - startTime,
      stateDurations
    });
  }
});

// Helper to find the next state in sequence
function findNextState(stateName) {
  const stateSequence = [
    "idle", "downloadingTemplate", "installingDependencies", 
    "generatingSchema", "validatingSchema", "healing", "done"
  ];
  const idx = stateSequence.indexOf(stateName);
  return idx >= 0 && idx < stateSequence.length - 1 ? stateSequence[idx + 1] : null;
}
```

#### Creating a Reusable Observer

For more advanced use cases, you can create a reusable observer:

```typescript
function createStateObserver(actor, options = {}) {
  const { 
    onTransition, 
    onEvent, 
    onComplete, 
    onError,
    states = {} // state-specific handlers
  } = options;
  
  return actor.subscribe((snapshot) => {
    // Call the generic transition handler
    if (onTransition) {
      onTransition(snapshot);
    }
    
    // Call state-specific handlers
    const currentState = snapshot.value;
    if (states[currentState]) {
      states[currentState](snapshot);
    }
    
    // Handle completion
    if (snapshot.matches("done") && onComplete) {
      onComplete(snapshot);
    }
    
    // Handle errors
    if (snapshot.context.error && onError) {
      onError(snapshot.context.error, snapshot);
    }
  });
}

// Usage example
const observer = createStateObserver(actor, {
  onTransition: (state) => {
    console.log(`Transitioned to: ${state.value}`);
  },
  states: {
    healing: (state) => {
      spinner.message(`Healing schema (attempt ${state.context.healingAttempt})...`);
      sendAnalyticsEvent(ctx.cwd, "healing_attempt", {
        attempt: state.context.healingAttempt
      });
    },
    done: (state) => {
      spinner.stop("Schema generation completed!");
    }
  },
  onComplete: (state) => {
    sendAnalyticsEvent(ctx.cwd, "workflow_completed", {
      success: !state.context.error,
      schemaPath: state.context.schemaFilePath
    });
  },
  onError: (error) => {
    spinner.stop("An error occurred");
    sendLogEvent(ctx.cwd, "error", error.message);
  }
});

// Clean up subscription when done
observer.unsubscribe();
```

## Usage

### Running with the CLI

Run the machine-based implementation using:

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Run the eval spec command
pnpm dev:machines:eval-spec

# Run the eval schema command (replace with your spec path)
SPEC_PATH=path/to/spec.json pnpm dev:machines:eval-schema

# Run the full workflow evaluation
pnpm dev:machines:eval-full

# Create a schema using a spec
SPEC_PATH=path/to/spec.json pnpm dev:machines:create-schema
```

### Directly from code

```typescript
import { 
  commandEvalSpecGeneration, 
  commandCreateSchemaMachine 
} from "@fiberplane/spectacular-cli/machines";

// Run the spec generation workflow
await commandEvalSpecGeneration();

// Create a schema with a spec
const result = await commandCreateSchemaMachine("path/to/spec.json");
if (result.success) {
  console.log(`Schema created at ${result.schemaPath}`);
}
```

### Command Line Tool

The package includes a CLI tool for running the machine-based implementation:

```bash
# Show help
npx spectacular-machine --help

# Run the spec generation evaluation
npx spectacular-machine eval-spec

# Run the schema generation with a spec
npx spectacular-machine eval-schema path/to/spec.json

# Run the full workflow evaluation
npx spectacular-machine eval-full

# Create a schema
npx spectacular-machine create-schema [path/to/spec.json]
``` 