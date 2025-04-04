import { spawn } from "node:child_process";

export async function runShell(
  cwd: string,
  commands: string[],
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  const commandStr = commands.join(" ");
  const stdoutChunks: Buffer[] = [];
  const stderrChunks: Buffer[] = [];

  return new Promise((resolve, reject) => {
    const child = spawn(commandStr, [], { cwd, shell: true, timeout: 60000 });

    child.on("error", (error) => {
      reject({
        exitCode: 1,
        stdout: Buffer.concat(stdoutChunks).toString(),
        stderr: error.message,
      });
    });

    child.stdout.on("data", (chunk) => {
      stdoutChunks.push(Buffer.from(chunk));
    });

    child.stderr.on("data", (chunk) => {
      stderrChunks.push(Buffer.from(chunk));
    });

    child.on("exit", (code) => {
      const stdout = Buffer.concat(stdoutChunks).toString();
      const stderr = Buffer.concat(stderrChunks).toString();

      resolve({
        exitCode: code || 0,
        stdout,
        stderr,
      });
    });
  });
}
