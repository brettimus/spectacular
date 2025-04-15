import { fromPromise } from "xstate/actors";

export const installDependenciesNoopActor = fromPromise<void, void>(
  async () => {
    console.log(
      "installDependenciesNoopActor is a noop, please provide a custom implementation",
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
  },
);
