#!/usr/bin/env node
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { isError } from "@/types";
import { handleCancel, handleError } from "@/utils/utils";
import { confirm, intro, isCancel, outro } from "@clack/prompts";
import pico from "picocolors";
import { actionCreateSchema } from "../../actions/create-schema";
import { actionDownloadTemplate } from "../../actions/download-template";
import { SPECTACULAR_TITLE } from "../../const";
import { initContext } from "../../context";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rulesDir = path.join(__dirname, "rules");

export async function commandCreateSchema() {
  console.log("");
  console.log(pico.magentaBright(pico.bold(SPECTACULAR_TITLE)));
  console.log("");

  intro("😮 spectacular - Create Schema");

  const ctx = initContext();

  try {
    const shouldDownloadTemplate = await confirm({
      message:
        "Do you want to download a HONC template? (will overwrite existing template files)",
      initialValue: true,
    });

    if (isCancel(shouldDownloadTemplate)) {
      handleCancel();
    }

    if (isError(shouldDownloadTemplate)) {
      handleError(shouldDownloadTemplate);
    }

    if (typeof shouldDownloadTemplate === "boolean" && shouldDownloadTemplate) {
      // First, ensure we have a template downloaded
      const downloadTemplateResult = await actionDownloadTemplate(ctx);

      if (isCancel(downloadTemplateResult)) {
        handleCancel();
      }

      if (isError(downloadTemplateResult)) {
        handleError(downloadTemplateResult);
      }
    }

    // Then generate the schema
    ctx.rulesDir = rulesDir;
    await actionCreateSchema(ctx);

    outro("Schema creation completed successfully! 🎉");
  } catch (error) {
    outro(`Schema creation failed: ${(error as Error).message} 😢`);
    process.exit(1);
  }
}
