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

export async function completeTask(options: CompleteTaskOptions): Promise<void> {
  try {
    // Validate inputs
    if (!options.prUrl || !options.commitSha) {
      throw new ValidationError("--pr-url and --commit-sha are required");
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
