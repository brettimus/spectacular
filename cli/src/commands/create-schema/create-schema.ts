#!/usr/bin/env node
import { intro, outro } from "@clack/prompts";
import pico from "picocolors";
import { SPECTACULAR_TITLE } from "../../const";
import { actionDownloadTemplate } from "../../actions/download-template";
import { initContext } from "../../context";

export async function commandCreateSchema() {
  console.log("");
  console.log(pico.magentaBright(pico.bold(SPECTACULAR_TITLE)));
  console.log("");

  intro("😮 spectacular - Create Schema");

  const ctx = initContext();

  // TODO - Load context from `.spectacular` folder

  await actionDownloadTemplate(ctx);

  // TODO: Implement create-schema functionality
  //
  // 1. Read the spec file
  // 2. Determine database tables from the spec
  // 3. Break down each operation that we want to perform to create the schema
  // 4. Select relevant RULES to implement the proposed operations
  // 5. For each operation:
  //    - Search for relevant RULES from 4 to implement the operation
  //    - Generate a schema for each table
  // 6. Verify the generated schema with a thinking model
  // 7. Save the schema to `db/schema.ts`
  // 8. Run `tsc` to compile the code
  //    - Feed errors back into a fixer
  //
  outro("Schema creation still being implemented");
}
