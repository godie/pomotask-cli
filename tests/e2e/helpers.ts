/**
 * E2E Test Helpers
 * 
 * Provides utilities to run the Pomotask CLI as a subprocess
 * for end-to-end testing.
 */

import { spawn } from "node:child_process";
import { join } from "node:path";

export interface CliResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface CliOptions {
  env?: Record<string, string>;
  timeout?: number;
}

/**
 * Path to the CLI entrypoint
 */
const CLI_PATH = join(process.cwd(), "dist", "index.js");

/**
 * Run the Pomotask CLI with given arguments
 */
export async function runCli(
  args: string[],
  options: CliOptions = {}
): Promise<CliResult> {
  const { env = {}, timeout = 30000 } = options;

  return new Promise((resolve, reject) => {
    const child = spawn("node", [CLI_PATH, ...args], {
      env: { ...process.env, ...env },
      timeout,
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: code ?? 0,
      });
    });

    child.on("error", (err) => {
      reject(new Error(`Failed to spawn CLI: ${err.message}`));
    });
  });
}

/**
 * Parse JSON output from CLI, handling potential trailing newlines
 */
export function parseJsonOutput(stdout: string): unknown {
  const trimmed = stdout.trim();
  if (!trimmed) {
    return null;
  }
  return JSON.parse(trimmed);
}

/**
 * Parse JSON output with type assertion
 */
export function parseJsonOutputAs<T>(stdout: string): T {
  return parseJsonOutput(stdout) as T;
}

/**
 * Default test environment variables
 */
export const TEST_ENV = {
  CONVEX_URL: "https://test.convex.cloud",
  POMOTASK_AGENT_ID: "test-agent-001",
};
