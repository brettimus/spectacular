import { fromPromise } from "xstate";
import type { ErrorInfo, ValidateTypescriptInputs } from "./types";

export const validateTypeScriptNoopActor = fromPromise<
  ErrorInfo[],
  ValidateTypescriptInputs
>(() => Promise.resolve([]));
