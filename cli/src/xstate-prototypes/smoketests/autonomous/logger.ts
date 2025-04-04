import { writeFileSync } from "node:fs";
import path from "node:path";
import type { SnapshotFrom } from "xstate";

export const createLogger = (logsDir: string, machineName: string) => {
  let previousState: string | undefined;

  // biome-ignore lint/suspicious/noExplicitAny: Moving fast
  return (snapshot: SnapshotFrom<any>) => {
    console.log(`=== Received ${machineName} snapshot ===`);
    console.log(`-> ${machineName}.snapshot.value`, snapshot.value);

    if (previousState !== snapshot.value) {
      console.log(`-> ${machineName}.transition`, snapshot.value);

      // Save the state machine context to a file when there's a state transition
      const timestamp = new Date().toISOString().replace(/:/g, "-");
      const stateTransitionFile = path.join(
        logsDir,
        `state-${timestamp}-${machineName}.json`,
      );

      // Create a safe-to-serialize version of the context
      const contextToSave = {
        state: snapshot.value,
        previousState,
        context: JSON.parse(JSON.stringify(snapshot.context)),
        timestamp: new Date().toISOString(),
      };

      try {
        writeFileSync(
          stateTransitionFile,
          JSON.stringify(contextToSave, null, 2),
        );
        console.log(`State transition saved to: ${stateTransitionFile}`);
      } catch (error) {
        console.error("Failed to save state transition:", error);
      }

      previousState = snapshot.value;
    }
  };
};
