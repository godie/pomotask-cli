/**
 * Exit codes — single source of truth.
 * CLI commands MUST use these constants. Never hardcode numbers.
 */
export const EXIT_CODES = {
  SUCCESS: 0,
  NO_TASKS_AVAILABLE: 1,
  NETWORK_ERROR: 2,
  VALIDATION_ERROR: 3,
  INVALID_AGENT_OR_ENV: 4,
} as const;

export type ExitCode = (typeof EXIT_CODES)[keyof typeof EXIT_CODES];
