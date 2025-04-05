import z from "zod";

export type ValidateTypescriptInputs = {
  projectDir: string;
  packageManager?: string;
};

// Define a Zod schema for the exec error
export const ExecErrorSchema = z
  .object({
    message: z.string(),
    code: z.number().optional(),
    killed: z.boolean().optional(),
    signal: z.union([z.string(), z.null()]).optional(),
    cmd: z.string().optional(),
    stdout: z.union([z.string(), z.instanceof(Buffer)]).optional(),
    stderr: z.union([z.string(), z.instanceof(Buffer)]).optional(),
  })
  .passthrough();

// Type for the exec error based on the schema
export type ExecError = z.infer<typeof ExecErrorSchema>;

// Function to validate if an error matches the ExecError schema
export function isExecError(error: unknown): error is ExecError {
  if (!(error instanceof Error)) {
    return false;
  }

  // Check specific properties we care about
  return (
    "stdout" in error || "stderr" in error || "code" in error || "cmd" in error
  );
}

export type ErrorInfo = {
  message: string;
  severity: "error" | "warning";
  location?: string;
};
