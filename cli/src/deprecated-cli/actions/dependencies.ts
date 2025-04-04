import path from "node:path";
import type { Context } from "@/deprecated-cli/context";
import { runShell } from "@/deprecated-cli/utils";
import { log, spinner } from "@clack/prompts";

export async function actionDependencies(ctx: Context) {
  if (!ctx.cwd) {
    log.error("current working directory is not defined in context");
    process.exit(1);
  }

  const installDir = path.join(ctx.cwd);
  const s = spinner();
  try {
    s.start("Installing dependencies...");
    await runShell(installDir, [ctx.packageManager, "install"]);
    s.stop();
    log.success("Dependencies installed successfully");
  } catch (error) {
    log.error("Dependencies installation failed");
    log.step(
      `Run npm install inside ${ctx.specPath} to install the dependencies manually`,
    );

    return error;
  }

  return;
}
