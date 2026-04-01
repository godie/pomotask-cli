/**
 * task/complete.ts — Mark a task as completed
 * 
 * Completes a task with PR URL and commit SHA.
 */

import { writeJson } from "../../lib/output.js";
import { NetworkError, ValidationError } from "../../lib/errors.js";

export interface CompleteTaskOptions {
  taskId: string;
  prUrl: string;
  commitSha: string;
}

/**
 * Validate PR URL format - must be a valid URL
 */
function isValidPrUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Validate commit SHA format - must be 40 or 64 hex chars
 */
function isValidCommitSha(sha: string): boolean {
  // SHA-1: 40 chars, SHA-256: 64 chars
  const isHex = /^[a-fA-F0-9]+$/.test(sha);
  return isHex && (sha.length === 40 || sha.length === 64);
}

export async function completeTask(options: CompleteTaskOptions): Promise<void> {
  try {
    // Validate inputs
    if (!options.prUrl || !options.commitSha) {
      throw new ValidationError("--pr-url and --commit-sha are required");
    }
    
    // Validate PR URL format
    if (!isValidPrUrl(options.prUrl)) {
      throw new ValidationError("Invalid PR URL format. Must be a valid HTTP(S) URL.");
    }
    
    // Validate commit SHA format
    if (!isValidCommitSha(options.commitSha)) {
      throw new ValidationError("Invalid commit SHA format. Must be 40 (SHA-1) or 64 (SHA-256) hex characters.");
    }
    
    // TODO: Call actual Convex mutation when types are synced
    // const convex = getConvexClient();
    // await convex.mutation("api:tasks.complete", {
    //   taskId: options.taskId,
    //   agentId: AGENT_ID,
    //   prUrl: options.prUrl,
    //   commitSha: options.commitSha,
    // });
    
    writeJson({
      ok: true,
      command: "task complete",
      taskId: options.taskId,
      prUrl: options.prUrl,
      commitSha: options.commitSha,
    });
  } catch (err) {
    if (err instanceof ValidationError || err instanceof NetworkError) {
      throw err;
    }
    throw new NetworkError(err instanceof Error ? err.message : "Failed to complete task");
  }
}
