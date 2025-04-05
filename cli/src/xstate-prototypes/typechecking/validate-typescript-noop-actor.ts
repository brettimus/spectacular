import { fromPromise } from "xstate";
import type { ErrorInfo, ValidateTypescriptInputs } from "./types";

/**
 * A noop actor that returns an empty array of errors
 * This is useful for base implementations of machines that don't yet have a strategy for typechecking
 *
 * It helps set the *types* of any `validateTypescript` actor that gets added with `.provide`
 */
export const validateTypeScriptNoopActor = fromPromise<
  ErrorInfo[],
  ValidateTypescriptInputs
>(() => Promise.resolve([]));
