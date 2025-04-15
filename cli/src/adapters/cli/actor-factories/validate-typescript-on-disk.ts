import {
  type ErrorInfo,
  validateTypeScriptOnDisk,
} from "@/typechecking";
import type { PackageManager } from "@/utils/package-manager";
import { fromPromise } from "xstate";

export const createValidateTypeScriptOnDiskActor = (
  projectDir: string,
  packageManager: PackageManager,
) =>
  fromPromise<ErrorInfo[]>(({ signal }) =>
    validateTypeScriptOnDisk(projectDir, packageManager, signal),
  );
