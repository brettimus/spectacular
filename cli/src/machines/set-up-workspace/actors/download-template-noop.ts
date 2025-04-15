import { fromPromise } from "xstate/actors";

export const downloadTemplateNoopActor = fromPromise<void, void>(async () => {
  console.log(
    "downloading template is a noop, please provide a custom implementation",
  );
  await new Promise((resolve) => setTimeout(resolve, 1000));
});
