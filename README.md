# pomotask-cli

CLI for Pomotask — deterministic, auditable interface for LLM agents.

## Setup

```bash
pnpm install
cp .env.example .env
# Edit .env with your Convex URL and agent ID
pnpm sync-types  # Requires ../Pomotask/convex/_generated
pnpm build
```

## Usage

```bash
pomotask task claim --type codegen
pomotask task progress <taskId> "message"
pomotask task complete <taskId> --pr-url <url> --commit-sha <sha>
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | No tasks available |
| 2 | Network / timeout error |
| 3 | Validation error |
| 4 | Invalid agent or environment |

See `AGENT.md` for full contract details.
