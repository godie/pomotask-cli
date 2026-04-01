/**
 * task/fail.ts — Mark a task as failed
 * 
 * Marks a task as failed with a reason.
 */

import { writeJson } from "../../lib/output.js";
import { NetworkError, ValidationError } from "../../lib/errors.js";

export interface FailTaskOptions {
  taskId: string;
  reason: string;
}

export async function failTask(options: FailTaskOptions): Promise<void> {
  try {
    // Validate inputs
    if (!options.reason) {
      throw new ValidationError("--reason is required");
    }
    
    // TODO: Call actual Convex mutation when types are synced
    // const convex = getConvexClient();
    // await convex.mutation("api:tasks.fail", {
    //   taskId: options.taskId,
    //   agentId: AGENT_ID,
    //   reason: options.reason,
    // });
    
    writeJson({
      ok: true,
      command: "task fail",
      taskId: options.taskId,
      reason: options.reason,
    });
  } catch (err) {
    if (err instanceof ValidationError || err instanceof NetworkError) {
      throw err;
    }
    throw new NetworkError(err instanceof Error ? err.message : "Failed to mark task as failed");
  }
}
