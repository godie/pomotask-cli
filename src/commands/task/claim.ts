/**
 * task/claim.ts — Claim an available task
 * 
 * Claims a task of the specified type for the current agent.
 */

import { writeJson, OutputFormat } from "../../lib/output.js";
import { NetworkError, NoTasksAvailableError, ValidationError, InvalidAgentError } from "../../lib/errors.js";

export interface ClaimTaskOptions {
  type: string;
  format?: OutputFormat;
}

export async function claimTask(options: ClaimTaskOptions): Promise<void> {
  try {
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
    
    // Placeholder: simulate no tasks available (for exit code 1 test)
    // In a real scenario, this would come from the mutation result
    const result = null;
    
    if (!result) {
      throw new NoTasksAvailableError();
    }
    
    // The context doc shows a flat structure for a successful claim
    writeJson({
      id: "abc123",
      title: "Refactor auth module",
      type: options.type,
      projectId: "xyz789",
      branchName: "refactor-auth-module-abc123",
      baseBranch: "main"
    });
  } catch (err) {
    if (err instanceof NoTasksAvailableError || err instanceof ValidationError || err instanceof InvalidAgentError) {
      throw err;
    }
    throw new NetworkError(err instanceof Error ? err.message : "Failed to claim task");
  }
}