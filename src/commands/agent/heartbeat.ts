/**
 * agent/heartbeat.ts — Send agent heartbeat
 * 
 * Sends a heartbeat to indicate the agent is alive.
 */

import { AGENT_ID } from "../../lib/convex.js";
import { writeJson } from "../../lib/output.js";
import { InvalidAgentError, NetworkError } from "../../lib/errors.js";

export async function sendHeartbeat(): Promise<void> {
  try {
    // Validate that agent ID is configured
    if (!AGENT_ID) {
      throw new InvalidAgentError("POMOTASK_AGENT_ID is required for heartbeat");
    }
    
    // TODO: Call actual Convex mutation when types are synced
    // const convex = getConvexClient();
    // const result = await convex.mutation("api:agents.heartbeatTask", {
    //   agentId: AGENT_ID,
    // });
    
    // Placeholder response
    writeJson({
      ok: true,
      command: "agent heartbeat",
      data: {
        agentId: AGENT_ID,
        status: "alive",
        lastHeartbeat: new Date().toISOString(),
      },
    });
  } catch (err) {
    if (err instanceof InvalidAgentError || err instanceof NetworkError) {
      throw err;
    }
    throw new NetworkError(err instanceof Error ? err.message : "Failed to send heartbeat");
  }
}
