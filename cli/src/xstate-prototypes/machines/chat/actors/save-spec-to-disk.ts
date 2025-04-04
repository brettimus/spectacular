import fs from "node:fs";
import { fromPromise } from "xstate";

// NOTE - This
export const saveSpecToDiskActor = fromPromise<
  void,
  { spec: string; specLocation: string }
>(async ({ input }) => {
  fs.writeFileSync(input.specLocation, input.spec);
});
