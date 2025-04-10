import {
  type ErrorInfo,
  validateTypeScriptOnDisk,
} from "@/xstate-prototypes/typechecking";
import type { PackageManager } from "@/xstate-prototypes/utils/package-manager";
import { fromPromise } from "xstate";

export const createValidateTypeScriptOnDiskActor = (
  projectDir: string,
  packageManager: PackageManager,
) =>
  fromPromise<ErrorInfo[]>(({ signal }) =>
    validateTypeScriptOnDisk(projectDir, packageManager, signal),
  );
