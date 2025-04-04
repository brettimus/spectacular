import { runShell } from "@/xstate-prototypes/utils";
import { fromPromise } from "xstate/actors";

export const installDependenciesActor = fromPromise<
  void,
  { projectDir: string; packageManager?: "npm" | "yarn" | "pnpm" | "bun" }
>(async ({ input: { projectDir, packageManager = "npm" } }) => {
  await installDependencies(projectDir, packageManager);
});

export async function installDependencies(
  projectDir: string,
  packageManager: "npm" | "yarn" | "pnpm" | "bun",
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
