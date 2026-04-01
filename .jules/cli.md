# CLI Journal

Notes from the implementation agent.

## Decisions

- **Centralized Output Control**: All output (stdout/stderr) is routed through `src/lib/output.ts` to ensure strict JSON formatting for agents.
- **Error Mapping Strategy**: Convex and system errors are caught and transformed in `src/lib/errors.ts` to stable CLI Exit Codes (0-4). This prevents stack trace leakage to stdout.
- **Hard Timeout**: A 10-second hard timeout is enforced for all Convex operations using the `withTimeout` utility in `src/lib/convex.ts`.
- **Progress Normalization**: The `task progress` command automatically normalizes messages (single line, collapsed whitespace) and truncates to 280 characters before sending to the backend.
- **Lazy Client Initialization**: The Convex client is initialized only after environment variables are validated to ensure Exit Code 4 is correctly triggered if configuration is missing.
- **Sanitized Filters**: Input filters for commands like `task list` are sanitized to ensure safety before being sent to Convex queries.
- **Input Validation**: Strict validation for PR URLs and commit SHAs (supporting both SHA-1 and SHA-256 formats) is implemented in `task complete`.

## Surprises

- `ConvexClient` from `convex/browser` is used for Node.js compatibility without requiring full React/Browser dependencies, while maintaining a lightweight footprint.

## Blockers

- Initial lack of synced types required placeholders in command implementations; these will be resolved once `pnpm sync-types` is executed against a valid sibling repo.
