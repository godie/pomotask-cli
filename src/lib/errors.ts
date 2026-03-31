import { EXIT_CODES, type ExitCode } from "./exitcodes.js";
import { writeStderr } from "./output.js";

/**
 * Error classes mapped to CLI exit codes.
 * Commands catch these and exit with the appropriate code.
 */

export class PomotaskCliError extends Error {
  constructor(
    message: string,
    public readonly exitCode: ExitCode,
  ) {
    super(message);
    this.name = "PomotaskCliError";
  }
}

export class NoTasksAvailableError extends PomotaskCliError {
  constructor() {
    super("No tasks available", EXIT_CODES.NO_TASKS_AVAILABLE);
    this.name = "NoTasksAvailableError";
  }
}

export class NetworkError extends PomotaskCliError {
  constructor(message = "Network error or timeout") {
    super(message, EXIT_CODES.NETWORK_ERROR);
    this.name = "NetworkError";
  }
}

export class ValidationError extends PomotaskCliError {
  constructor(message: string) {
    super(message, EXIT_CODES.VALIDATION_ERROR);
    this.name = "ValidationError";
  }
}

export class InvalidAgentError extends PomotaskCliError {
  constructor(message = "Invalid agent or environment") {
    super(message, EXIT_CODES.INVALID_AGENT_OR_ENV);
    this.name = "InvalidAgentError";
  }
}

/**
 * Map unknown errors to exit codes.
 * Prevents raw stack traces from leaking to stdout.
 */
export function mapError(err: unknown): PomotaskCliError {
  if (err instanceof PomotaskCliError) return err;

  const message = err instanceof Error ? err.message : String(err);

  // Heuristic: network-related
  if (
    message.includes("fetch") ||
    message.includes("timeout") ||
    message.includes("network") ||
    message.includes("ECONNREFUSED") ||
    message.includes("ENOTFOUND")
  ) {
    return new NetworkError(message);
  }

  // Default: treat as internal error (network category for safety)
  writeStderr(`Unexpected error: ${message}`);
  return new NetworkError("Internal error");
}
