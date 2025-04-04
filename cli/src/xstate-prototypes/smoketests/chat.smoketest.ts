import { createActor } from "xstate";
import { config } from "dotenv";
import { chatMachine } from "../machines/chat";

config();

const actor = createActor(chatMachine, {
  input: {
    apiKey: process.env.OPENAI_API_KEY ?? "",
    cwd: process.cwd(),
  },
  inspect: (_inspectionEvent) => {
    // type: '@xstate.actor' or
    // type: '@xstate.snapshot' or
    // type: '@xstate.event'
    // console.log("----->", inspectionEvent);
  },
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
  type: "user.message",
  prompt: "api for geese",
});
