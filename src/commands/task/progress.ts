/**
 * task/progress.ts — Report progress on a task
 * 
 * Reports progress with optional level (info|warn|error).
 * Normalizes message to single line, truncates to 280 chars.
 */

import { writeJson } from "../../lib/output.js";
import { NetworkError } from "../../lib/errors.js";

export interface ProgressOptions {
  taskId: string;
  message: string;
  level?: "info" | "warn" | "error";
}

/**
 * Normalize progress message:
 * - Single line (replace newlines and multiple spaces with a single space)
 * - Truncate to 280 characters with ellipsis
 */
export function normalizeProgressMessage(message: string, maxLength = 280): string {
  // Replace newlines and multiple spaces with a single space
  const singleLine = message.replace(/\s+/g, " ").trim();
  
  // Truncate if too long
  if (singleLine.length > maxLength) {
    return singleLine.substring(0, maxLength - 3) + "...";
  }
  
  return singleLine;
}

export async function reportProgress(options: ProgressOptions): Promise<void> {
  try {
    // TODO: Call actual Convex mutation when types are synced
    // const convex = getConvexClient();
    // await convex.mutation("api:tasks.reportProgress", {
    //   taskId: options.taskId,
    //   message: normalizedMessage,
    //   level,
    // });
    
    // Normalize message
    const normalizedMessage = normalizeProgressMessage(options.message);
    const level = options.level || "info";
    
    writeJson({
      ok: true,
      command: "task progress",
      taskId: options.taskId,
      message: normalizedMessage,
      level,
    });
  } catch (err) {
    throw new NetworkError(err instanceof Error ? err.message : "Failed to report progress");
  }
}
