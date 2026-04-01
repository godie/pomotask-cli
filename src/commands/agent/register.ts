/**
 * agent/register.ts — Register a new agent
 * 
 * Registers an agent with name, type, and capabilities.
 */

import { getConvexClient } from "../../lib/convex.js";
import { writeJson } from "../../lib/output.js";
import { NetworkError, ValidationError } from "../../lib/errors.js";

export interface RegisterAgentOptions {
  name: string;
  type: string;
  capabilities: string;
}

/**
 * Parse capabilities from comma-separated string to array
 */
function parseCapabilities(capabilitiesStr: string): string[] {
  return capabilitiesStr
    .split(",")
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
}

export async function registerAgent(options: RegisterAgentOptions): Promise<void> {
  try {
    // Validate required fields
    if (!options.name || options.name.trim() === "") {
      throw new ValidationError("--name is required");
    }
    
    if (!options.type || options.type.trim() === "") {
      throw new ValidationError("--type is required");
    }
    
    // Parse capabilities
    const capabilities = options.capabilities
      ? parseCapabilities(options.capabilities)
      : [];
    
    // TODO: Call actual Convex mutation when types are synced
    // const convex = getConvexClient();
    // const result = await convex.mutation("api:agents.register", {
    //   name: options.name,
    //   type: options.type,
    //   capabilities,
    // });
    
    // Placeholder response
    writeJson({
      ok: true,
      command: "agent register",
      data: {
        agentId: `agent-${Date.now()}`,
        name: options.name,
        type: options.type,
        capabilities,
        registeredAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    if (err instanceof ValidationError || err instanceof NetworkError) {
      throw err;
    }
    throw new NetworkError(err instanceof Error ? err.message : "Failed to register agent");
  }
}
