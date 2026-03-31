import { ConvexClient } from "convex/browser";
import { InvalidAgentError } from "./errors.js";

const CONVEX_URL = process.env.CONVEX_URL;
const POMOTASK_AGENT_ID = process.env.POMOTASK_AGENT_ID;

/**
 * Validate environment and initialize Convex client.
 * Call once at startup — exported as singleton.
 */
if (!CONVEX_URL || !POMOTASK_AGENT_ID) {
  throw new InvalidAgentError(
    !CONVEX_URL
      ? "CONVEX_URL is required"
      : "POMOTASK_AGENT_ID is required",
  );
}

export const convex = new ConvexClient(CONVEX_URL);

export const AGENT_ID = POMOTASK_AGENT_ID;

export const CONVEX_TIMEOUT_MS = 10_000;
