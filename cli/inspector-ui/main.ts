import { createBrowserInspector } from "@statelyai/inspect";
import { createActor } from "xstate";
import { chatMachine } from "../src/machines";

const inspector = createBrowserInspector();

const actor = createActor(chatMachine, {
  input: {
    apiKey: "abc123",
  },
  inspect: inspector.inspect,
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

actor.start();

actor.send({
  type: "user.message.added",
  content: "api for geese",
});
