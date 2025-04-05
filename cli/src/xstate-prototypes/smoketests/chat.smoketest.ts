import { config } from "dotenv";
import { createActor } from "xstate";
import { cliChatMachine } from "../adapters/cli";

config();

const actor = createActor(cliChatMachine, {
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
  content: "api for geese",
});
