import { ConvexClient } from "convex";
import { InvalidAgentError } from "./errors.js";

/**
 * Get environment variables - wrapped for testability
 */
function getEnvVar(name: string): string | undefined {
  return process.env[name];
}

const CONVEX_URL = getEnvVar("CONVEX_URL");
const POMOTASK_AGENT_ID = getEnvVar("POMOTASK_AGENT_ID");

/**
 * Validate environment and initialize Convex client.
 * Call once at startup — exported as singleton.
 */
function validateEnvironment(): void {
  if (!CONVEX_URL || !POMOTASK_AGENT_ID) {
    throw new InvalidAgentError(
      !CONVEX_URL
        ? "CONVEX_URL is required"
        : "POMOTASK_AGENT_ID is required",
    );
  }
}

// Validate at module load time (runtime behavior)
validateEnvironment();

export const convex = new ConvexClient(CONVEX_URL as string);

export const AGENT_ID = POMOTASK_AGENT_ID;

export const CONVEX_TIMEOUT_MS = 10_000;

// Export for testing - allows mocking env vars
export const ENV = {
  CONVEX_URL,
  POMOTASK_AGENT_ID,
};
