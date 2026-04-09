import { ConvexClient } from "convex/browser";
import { InvalidAgentError, NetworkError } from "./errors.js";

/**
 * Get environment variables - wrapped for testability
 */
function getEnvVar(name: string): string | undefined {
  return process.env[name];
}

/**
 * Validate environment. Throws InvalidAgentError if invalid.
 */
export function validateEnvironment(): void {
  const url = getEnvVar("CONVEX_URL");
  const agentId = getEnvVar("POMOTASK_AGENT_ID");

  if (!url || !agentId) {
    throw new InvalidAgentError(
      !url
        ? "CONVEX_URL is required"
        : "POMOTASK_AGENT_ID is required",
    );
  }
}

/**
 * Get Convex client - lazy initialization after validation
 */
let convexClient: ConvexClient | null = null;

export function getConvexClient(): ConvexClient {
  if (!convexClient) {
    validateEnvironment();
    convexClient = new ConvexClient(getEnvVar("CONVEX_URL") as string);
  }
  return convexClient;
}

export const AGENT_ID = getEnvVar("POMOTASK_AGENT_ID");

export const CONVEX_URL = getEnvVar("CONVEX_URL");

export const CONVEX_TIMEOUT_MS = 10_000;

/**
 * Wrap a Convex query/mutation with timeout.
 * Throws NetworkError if the operation exceeds CONVEX_TIMEOUT_MS.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = CONVEX_TIMEOUT_MS,
): Promise<T> {
  let timeoutId: NodeJS.Timeout | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new NetworkError(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}
