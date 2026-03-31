import process from "node:process";

/**
 * Output discipline: all stdout/stderr MUST go through this module.
 * NEVER use console.log / console.error directly in commands.
 */

export type OutputFormat = "json" | "human";

/**
 * Write final JSON result to stdout.
 */
export function writeJson(data: unknown): void {
  process.stdout.write(JSON.stringify(data, null, 2) + "\n");
}

/**
 * Write a debug/info message to stderr.
 */
export function writeStderr(message: string): void {
  process.stderr.write(message + "\n");
}

/**
 * Format data for human-readable output (debugging only).
 */
export function formatHuman(data: unknown): string {
  return JSON.stringify(data, null, 2);
}
