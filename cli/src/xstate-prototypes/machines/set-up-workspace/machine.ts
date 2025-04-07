// import { getPackageManager } from "@/xstate-prototypes/utils";
import { log } from "@/xstate-prototypes/utils/logging";
import { assign, setup } from "xstate";
import {
  downloadTemplateNoopActor,
  installDependenciesNoopActor,
} from "./actors";

type SetUpWorkspaceMachineContext = {
  error: unknown;
};

type SetUpWorkspaceMachineOutput = {
  error: unknown;
};

export const setUpWorkspaceMachine = setup({
  types: {
    context: {} as SetUpWorkspaceMachineContext,
    events: {} as { type: "user.cancel" },
    output: {} as SetUpWorkspaceMachineOutput,
  },
  actors: {
    downloadTemplate: downloadTemplateNoopActor,
    installDependencies: installDependenciesNoopActor,
  },
}).createMachine({
  id: "configure-workspace",
  description: "set up project workspace with template and dependencies",
  initial: "DownloadingTemplate",
  context: {
    error: null,
  },
  states: {
    DownloadingTemplate: {
      entry: () =>
        log("info", "Downloading template files", {
          stage: "download-template",
        }),
      invoke: {
        id: "downloadTemplate",
        src: "downloadTemplate",
        onDone: {
          target: "InstallingDependencies",
        },
        onError: {
          target: "Failed",
          // This is typesafe for some reason, and using an action object with params is not
          actions: assign({
            error: ({ event }) => event?.error,
          }),
        },
      },
    },
    InstallingDependencies: {
      entry: () =>
        log("info", "Installing dependencies", {
          stage: "install-dependencies",
        }),
      invoke: {
        id: "installDependencies",
        src: "installDependencies",
        onDone: {
          target: "Success",
        },
        onError: {
          target: "Failed",
          actions: assign({
            error: ({ event }) => event?.error,
          }),
        },
      },
    },
    Success: {
      type: "final",
    },
    Failed: {
      type: "final",
      entry: [
        assign({
          error: ({ context }) =>
            context.error ?? new Error("Failed to set up workspace"),
        }),
      ],
    },
  },

  output: ({ context }) => ({
    error: context.error,
  }),
});
