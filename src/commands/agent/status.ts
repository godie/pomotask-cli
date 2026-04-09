/**
 * agent/status.ts — Get agent status
 * 
 * Retrieves status for the current agent.
 */

import { AGENT_ID } from "../../lib/convex.js";
import { writeJson } from "../../lib/output.js";
import { InvalidAgentError, NetworkError } from "../../lib/errors.js";

export async function getAgentStatus(): Promise<void> {
  try {
    // Validate that agent ID is configured
    if (!AGENT_ID) {
      throw new InvalidAgentError("POMOTASK_AGENT_ID is required to check status");
    }
    
    // TODO: Call actual Convex query when types are synced
    // const convex = getConvexClient();
    // const status = await convex.query("api:agents.getAgentStatus", {
    //   agentId: AGENT_ID,
    // });
    
    // Placeholder response
    writeJson({
      ok: true,
      command: "agent status",
      data: {
        agentId: AGENT_ID,
        status: "active",
        tasksClaimed: 0,
        tasksCompleted: 0,
        lastActive: new Date().toISOString(),
      },
    });
  } catch (err) {
    if (err instanceof InvalidAgentError || err instanceof NetworkError) {
      throw err;
    }
    throw new NetworkError(err instanceof Error ? err.message : "Failed to get agent status");
  }
}
