import { createActor } from "xstate";
import { createWebSocketInspector } from "@statelyai/inspect";
import { chatMachine } from "./actors/chat";
import { startInspectorServer } from "../xstate-inspector/server";

// Start the WebSocket relay server
// This will open a browser window with the Stately Inspector iframe
// that will relay messages between the CLI and the inspector
startInspectorServer();

// Function to check if an event is from XState
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function isXStateEvent(event: any): boolean {
  return event && 
    (event.type && (
      event.type.startsWith('@xstate') || 
      event.type === '@statelyai.connected' ||
      event.type === '@statelyai.disconnected'
    )) ||
    (event._version?.startsWith('1')); // XState event version
}

// Create a WebSocket inspector that connects to our relay server
const inspector = createWebSocketInspector({
  url: "ws://localhost:8080", // Connect to our WebSocket relay server
  // Add filter to only process XState events
  filter: (event) => isXStateEvent(event),
});

// Start the inspector
inspector.start();

const actor = createActor(chatMachine, {
  input: {
    cwd: process.cwd(),
  },
  // NOTE - The inspector does not work for us over websockets
  //        since our machine contains non-serializable values
  //        like actor functions
  //
  //        The only way to get the inspector to work is to
  //        run the machine in a browser - hopefully that would do the trick?
  //
  // inspect: inspector.inspect,
});

actor.subscribe((snapshot) => {
  console.log("=== Received chatMachine snapshot ===");
  // console.log("snapshot", snapshot);
  console.log("-> chatMachine.snapshot.value", snapshot.value);

  // Only for terminal state
  if (snapshot.output) {
    console.log("-> chatMachine.snapshot.output", snapshot.output);
  }
});

function startActorAndSendEvent() {
  // Start the actor
  actor.start();

  // Send the event
  console.log("Sending event to actor");
  actor.send({
    type: "promptReceived",
    prompt: "api for geese",
  });
}

// Fallback: If we don't receive the connection event within 5 seconds, start anyway
setTimeout(() => {
  startActorAndSendEvent();
}, 5000);