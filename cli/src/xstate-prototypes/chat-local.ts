import { createActor, waitFor } from "xstate";
import {
  ChatCliAdapter,
  localChatMachine,
  localDbSchemaCodegenMachine,
} from "./adapters";
import { createCliDbSchemaCodegenMachine } from "./adapters/cli";

const cli = new ChatCliAdapter(localChatMachine);

console.log("Chatting local");

cli.start(async (err: unknown) => {
  if (err) {
    console.error("Error in chat...", err);
    process.exit(1);
  }
  const output = cli.actor.getSnapshot().output;

  if (!output?.spec) {
    console.warn("There should have been a spec in the output but nooooo");
    process.exit(1);
  }

  const spec = output.spec.content;

  // TODO - Kick off db gen
  const dbMachine = createCliDbSchemaCodegenMachine(
    cli.projectDir as string,
    "npm",
    localDbSchemaCodegenMachine,
  );

  const dbSchemaActor = createActor(dbMachine, {
    input: {
      apiKey: "local",
      spec,
    },
  });

  // biome-ignore lint/suspicious/noExplicitAny: prototyping
  let lastState: any;

  dbSchemaActor.subscribe({
    next(snapshot) {
      if (snapshot.value !== lastState) {
        console.log("Hi DB changed state", snapshot.value);
      }
      lastState = snapshot.value;
    },
    complete() {
      console.log(
        "DB is DONE!!!",
        "context:\n",
        JSON.stringify(dbSchemaActor.getSnapshot().context, null, 2),
        "output:\n",
        JSON.stringify(dbSchemaActor.getSnapshot().output, null, 2),
      );
    },
    error(err) {
      throw err;
    },
  });

  dbSchemaActor.start();

  dbSchemaActor.send({
    type: "analyze.tables",
    spec,
  });

  await waitFor(dbSchemaActor, (state) => {
    return state.status === "done";
  });
});
