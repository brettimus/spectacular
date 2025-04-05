import { fromPromise } from "xstate/actors";

import type { InstallDependenciesInput } from "./install-dependencies";

export const installDependenciesNoopActor = fromPromise<
  void,
  InstallDependenciesInput
>(async () => {
  console.log(
    "installDependenciesNoopActor is a noop, please provide a custom implementation",
  );
  await new Promise((resolve) => setTimeout(resolve, 1000));
});
