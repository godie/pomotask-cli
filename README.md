# pomotask-cli

CLI for Pomotask — deterministic, auditable interface for LLM agents.

## Purpose
This CLI is the primary interface for LLM agents to interact with the Pomotask backend. It is designed to be called programmatically, providing stable JSON output and consistent exit codes to guide agent behavior.

## Setup

```bash
pnpm install
cp .env.example .env
# Edit .env with your Convex URL and agent ID
pnpm sync-types  # Requires sibling repo '../pomotask/convex/_generated'
pnpm build
```

## Environment Variables
The following environment variables are **required** for all operations:
- `CONVEX_URL`: The URL of your Convex deployment.
- `POMOTASK_AGENT_ID`: The unique ID of the agent as registered in the backend.

Missing or invalid environment variables will result in **Exit Code 4**.

## Usage

### Task Operations
- `pomotask task list [--status <status>] [--type <type>]`: List available tasks.
- `pomotask task claim --type <type>`: Claim a task of a specific type.
- `pomotask task progress <taskId> <message> [--level <info|warn|error>]`: Report progress. Message is normalized and truncated.
- `pomotask task complete <taskId> --pr-url <url> --commit-sha <sha>`: Mark task as completed.
- `pomotask task fail <taskId> --reason <reason>`: Mark task as failed.
- `pomotask task create --title <title> --type <type> --project <projectId>`: Create a new task.
- `pomotask task comment <taskId> --type <type> --message <message>`: Add a comment to a task.

### Agent Operations
- `pomotask agent register --name <name> --type <type> [--capabilities <caps>]`: Register a new agent.
- `pomotask agent heartbeat`: Update agent's last seen status.
- `pomotask agent status`: Get the current status of the agent.

## Exit Codes

| Code | Meaning | Agent Action |
|------|---------|--------------|
| 0 | Success | Continue flow |
| 1 | No tasks available | Wait / polling |
| 2 | Network / timeout error | Retry immediately |
| 3 | Validation / argument error | Correct logic/prompt and retry |
| 4 | Authentication / environment / agent error | Abort and request intervention |

## Output Discipline
- Final results are written to `stdout` as JSON.
- Debugging logs, warnings, and error messages are written to `stderr`.
- Use `--format human` for human-readable output (debugging only).

See `AGENT.md` for the full technical contract and `docs/integration-for-agents.md` for integration guides.
