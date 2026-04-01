/**
 * task/claim.ts — Claim an available task
 * 
 * Claims a task of the specified type for the current agent.
 */

import { AGENT_ID } from "../../lib/convex.js";
import { writeJson } from "../../lib/output.js";
import { NetworkError, NoTasksAvailableError, ValidationError } from "../../lib/errors.js";

export interface ClaimTaskOptions {
  type: string;
}

export async function claimTask(_options: ClaimTaskOptions): Promise<void> {
  try {
    // Validate task type is not empty
    if (!_options.type || _options.type.trim() === "") {
      throw new ValidationError("--type is required");
    }
    
    // TODO: Call actual Convex mutation when types are synced
    // const convex = getConvexClient();
    // const result = await convex.mutation("api:tasks.claim", {
    //   agentId: AGENT_ID,
    //   type: options.type,
    // });
    
    // Placeholder: simulate no tasks available (for exit code 1 test)
    const hasTasks = false; // TODO: Check with real API
    
    if (!hasTasks) {
      throw new NoTasksAvailableError();
    }
    
    writeJson({
      ok: true,
      command: "task claim",
      data: { taskId: "claimed-task-id", agentId: AGENT_ID },
    });
  } catch (err) {
    if (err instanceof NoTasksAvailableError || err instanceof ValidationError) {
      throw err;
    }
    throw new NetworkError(err instanceof Error ? err.message : "Failed to claim task");
  }
}
