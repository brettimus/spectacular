import type { SpectacularSchemaFile, SpectacularSpecFile } from "../utils";

export type ApiRoutesEvalInput = {
  runId: string;
  runDirectory: string;
  schemaFileDetails: SpectacularSchemaFile;
  specFileDetails: SpectacularSpecFile;
  projectDir?: string; // Optional because we compute it in some places
};
