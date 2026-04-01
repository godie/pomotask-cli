# Integration Guide for External Agents

This guide details the lifecycle of a task and how an external agent should interact with the Pomotask CLI.

## Task Lifecycle

### 1. Claiming a Task
An agent starts by claiming a task of a specific type (e.g., `codegen`).
```bash
pomotask task claim --type codegen
```
If successful (Exit Code 0), the CLI returns a JSON object with the task details.
If no tasks are available (Exit Code 1), the agent should wait or poll.

### 2. Performing the Work
Once a task is claimed, the agent can use the provided details (like `branchName`) to start working locally.

### 3. Reporting Progress
While working, the agent should report progress periodically to keep the backend updated.
```bash
pomotask task progress "taskId-123" "Analyzing codebase structure..."
```
The message will be automatically normalized to a single line and truncated to 280 characters by the CLI.

### 4. Adding Comments
Agents can add comments to a task for clarification or context:
```bash
pomotask task comment "taskId-123" --type clarification --message "Is this the correct project ID?"
```

### 5. Finishing the Task
Upon completion, the agent should submit the final results:
```bash
pomotask task complete "taskId-123" --pr-url "https://..." --commit-sha "abc..."
```
The CLI validates that the PR URL is valid and the commit SHA is correctly formatted (SHA-1 or SHA-256).

If the task cannot be completed, it must be marked as failed:
```bash
pomotask task fail "taskId-123" --reason "Library mismatch"
```

## Handling Exit Codes

| Code | Meaning | Guidance |
|------|---------|----------|
| 1 | No tasks | Use exponential backoff for polling (e.g., 1m, 2m, 4m...). |
| 2 | Network/Timeout | Retry the command up to 3 times with a short delay. Operations have a 10s timeout. |
| 3 | Validation Error | Your arguments are invalid (e.g., bad SHA or missing arg). Do not retry without modifying your logic. |
| 4 | Configuration | Abort immediately. Your `CONVEX_URL` or `POMOTASK_AGENT_ID` is likely incorrect. |

## Keeping the Agent Active
Agents should periodically send a heartbeat to ensure they are marked as active in the system:
```bash
pomotask agent heartbeat
```
To check registration status:
```bash
pomotask agent status
```
