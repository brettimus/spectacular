import { EventEmitter } from "node:events";

// Type definitions to match Node's ChildProcess API
export interface ChildProcessShim extends EventEmitter {
  pid?: number;
  killed: boolean;
  stdin: NodeJS.WriteStream | null;
  stdout: NodeJS.ReadStream | null;
  stderr: NodeJS.ReadStream | null;
  kill(signal?: string): boolean;
}

// Options interface matching Node's SpawnOptions
export interface SpawnOptionsShim {
  cwd?: string;
  env?: Record<string, string>;
  argv0?: string;
  stdio?: Array<"pipe" | "ignore" | "inherit"> | string;
  detached?: boolean;
  shell?: boolean | string;
}

/**
 * A browser-compatible shim for Node's child_process.spawn
 * This implementation simulates the behavior for browser environments
 * when used with Vite's node polyfill
 */
export function spawn(
  command: string,
  args?: string[],
  options?: SpawnOptionsShim
): ChildProcessShim {
  console.warn(
    `[Browser child_process shim] Attempted to spawn command: ${command} with args:`,
    args,
    options ? `with options: ${JSON.stringify(options)}` : "without options"
  );

  const childProcess = new EventEmitter() as ChildProcessShim;
  
  // Simulate a fake process ID
  childProcess.pid = Math.floor(Math.random() * 10000);
  childProcess.killed = false;
  childProcess.stdin = null;
  childProcess.stdout = null;
  childProcess.stderr = null;
  
  // Mock the kill method
  childProcess.kill = (signal?: string) => {
    if (!childProcess.killed) {
      childProcess.killed = true;
      childProcess.emit("exit", 0, signal || null);
      return true;
    }
    return false;
  };

  // Simulate process execution and completion
  setTimeout(() => {
    // Emit the exit event to simulate process completion
    childProcess.emit("exit", 0, null);
    childProcess.emit("close", 0);
  }, 10);

  return childProcess;
}

// Also export a mock for other common child_process methods if needed
export const exec = (command: string, callback: (error: Error | null, stdout: string, stderr: string) => void) => {
  console.warn(`[Browser child_process shim] Attempted to exec: ${command}`);
  callback(null, "", "");
};

export const execSync = (command: string): Buffer => {
  console.warn(`[Browser child_process shim] Attempted to execSync: ${command}`);
  return Buffer.from("");
};
