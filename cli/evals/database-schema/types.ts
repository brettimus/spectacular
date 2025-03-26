import type { SpectacularSpecFile } from "../utils";

export type DatabaseSchemaEvalInput = {
  runId: string;
  runDirectory: string;
  specFileDetails: SpectacularSpecFile;
  projectDir?: string; // Optional because we compute it in some places
};
