import { createActor } from "xstate";
import { chatMachine } from "./actors/chat";

const actor = createActor(chatMachine, {
  inspect: (_inspectionEvent) => {
    // type: '@xstate.actor' or
    // type: '@xstate.snapshot' or
    // type: '@xstate.event'
    // console.log("----->", inspectionEvent);
  },
})

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
  type: "promptReceived",
  prompt: "api for geese"
})
