import { join } from "node:path";
import type { Context } from "@/deprecated-cli/context";
import { safeReadFile } from "@/deprecated-cli/utils/utils";
import { log, spinner } from "@clack/prompts";
import { downloadTemplate } from "giget";

export async function actionDownloadTemplate(ctx: Context) {
  const s = spinner();
  s.start("Setting up template...");

  const templateUrl = "github:brettimus/mega-honc";

  try {
    log.step(`Downloading template into ${ctx.cwd}`);

    await downloadTemplate(templateUrl, {
      cwd: ctx.cwd,
      dir: ".",
      force: true,
      provider: "github",
    });

    const projectDir = ctx.cwd;

    // const _indexFile = safeReadFile(join(projectDir, "src", "index.ts"));
    const schemaFile = safeReadFile(join(projectDir, "src", "db", "schema.ts"));
    // const _seedFile = safeReadFile(join(projectDir, "seed.ts"));

    ctx.schemaFile = schemaFile?.toString();
  } catch (error) {
    return error;
  }

  s.stop();
  log.success(`Downloaded codebase to ${ctx.cwd}`);
  return;
}
