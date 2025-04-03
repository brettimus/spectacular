import { fromPromise } from "xstate";

export const saveSpecToApiActor = fromPromise<
  { spec: string; specLocation: string },
  { spec: string; specLocation: string }
>(async ({ input }) => {
  console.log("--> saving spec to api!");
  await new Promise((r) => setTimeout(r, 2200));
  return input;
});
