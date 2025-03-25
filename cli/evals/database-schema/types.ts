import type { SpectacularSpecFile } from "../utils";

export type DatabaseSchemaEvalInput = {
  runId: string;
  runDirectory: string;
  specFileDetails: SpectacularSpecFile;
};
