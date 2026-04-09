/**
 * task/claim.ts — Claim an available task
 * 
 * Claims a task of the specified type for the current agent.
 */

import { AGENT_ID, validateEnvironment } from "../../lib/convex.js";
import { writeJson, OutputFormat } from "../../lib/output.js";
import { NetworkError, NoTasksAvailableError, ValidationError, InvalidAgentError } from "../../lib/errors.js";

export interface ClaimTaskOptions {
  type: string;
  format?: OutputFormat;
}

export async function claimTask(options: ClaimTaskOptions): Promise<void> {
  try {
    // Validate environment first
    validateEnvironment();

    // Validate task type is not empty
    if (!options.type || options.type.trim() === "") {
      throw new ValidationError("--type is required");
    }
    
    // TODO: Call actual Convex mutation when types are synced
    // const convex = getConvexClient();
    // const result = await convex.mutation("api:tasks.claimTask", {
    //   agentId: AGENT_ID,
    //   type: options.type,
    // });
    
    const result: { taskId: string } | null = null;

    if (!result) {
      throw new NoTasksAvailableError();
    }

    const taskResult = result as { taskId: string };

    writeJson({
      taskId: taskResult.taskId,
      agentId: AGENT_ID,
    });
  } catch (err) {
    if (err instanceof NoTasksAvailableError || err instanceof ValidationError || err instanceof InvalidAgentError) {
      throw err;
    }
    throw new NetworkError(err instanceof Error ? err.message : "Failed to claim task");
  }
}
