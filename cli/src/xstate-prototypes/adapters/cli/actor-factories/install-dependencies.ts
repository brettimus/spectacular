import { runShell } from "@/xstate-prototypes/utils";
import type { PackageManager } from "@/xstate-prototypes/utils/package-manager";
import { fromPromise } from "xstate/actors";

export type InstallDependenciesInput = {
  projectDir: string;
  packageManager?: PackageManager;
};

export const createInstallDependenciesActor = (
  projectDir: string,
  packageManager: PackageManager,
) =>
  fromPromise<void, void>(async () => {
    await installDependencies(projectDir, packageManager);
  });

export async function installDependencies(
  projectDir: string,
  packageManager: PackageManager,
): Promise<void> {
  if (!projectDir) {
    console.error("Project directory is not defined");
    process.exit(1);
  }

  const installDir = projectDir;

  try {
    await runShell(installDir, [packageManager, "install"]);
    console.log("Dependencies installed successfully");
  } catch (error) {
    console.error("Dependencies installation failed");
    throw error;
  }
}
