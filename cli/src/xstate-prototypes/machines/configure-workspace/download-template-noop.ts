import { fromPromise } from "xstate/actors";
import type { DownloadTemplateInput } from "./download-template";

export const downloadTemplateNoopActor = fromPromise<
  void,
  DownloadTemplateInput
>(async () => {
  console.log(
    "downloading template is a noop, please provide a custom implementation",
  );
  await new Promise((resolve) => setTimeout(resolve, 1000));
});
