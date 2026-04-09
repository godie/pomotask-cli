/**
 * task/claim.ts — Claim an available task
 * 
 * Claims a task of the specified type for the current agent.
 */

import { CONVEX_URL, AGENT_ID } from "../../lib/convex.js";
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
    
    // Validate CONVEX_URL is set
    if (!CONVEX_URL) {
      throw new InvalidAgentError("CONVEX_URL is required");
    }
    
    // Validate POMOTASK_AGENT_ID is set
    if (!AGENT_ID) {
      throw new InvalidAgentError("POMOTASK_AGENT_ID is required");
    }
    
    // TODO: Call actual Convex mutation when types are synced
    // const convex = getConvexClient();
    // const result = await convex.mutation("api:tasks.claimTask", {
    //   agentId: AGENT_ID,
    //   type: options.type,
    // });
    
    // Stub: allow testing "no tasks" scenario via environment variable
    // In production, this would come from the Convex mutation result
    const simulateNoTasks = process.env.POMOTASK_SIMULATE_NO_TASKS === "true";
    const result = simulateNoTasks ? null : { 
      id: "abc123", 
      title: "Refactor auth module",
      type: options.type,
      projectId: "xyz789",
      branchName: "refactor-auth-module-abc123",
      baseBranch: "main"
    };
    
    if (!result) {
      throw new NoTasksAvailableError();
    }
    
    // The context doc shows a flat structure for a successful claim
    writeJson({
      ok: true,
      command: "task claim",
      id: result.id,
      title: result.title,
      type: options.type,
      projectId: result.projectId,
      branchName: result.branchName,
      baseBranch: result.baseBranch
    });
  } catch (err) {
    if (err instanceof NoTasksAvailableError || err instanceof ValidationError || err instanceof InvalidAgentError) {
      throw err;
    }
    throw new NetworkError(err instanceof Error ? err.message : "Failed to claim task");
  }
}