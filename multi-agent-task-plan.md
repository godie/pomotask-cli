# Multi-Agent Task Plan — Pomotask System

> **Orchestrator note**: This plan covers both `pomotask-cli` and `pomotask-mcp`.
> Repos are scaffolded and compiling. Agents work in phases to avoid conflicts.

---

## 📋 Agent Directory

| Agent | Role | Focus |
|-------|------|-------|
| **OpenHands** | Lead implementer | Core libs, critical commands, MCP server base |
| **Cursor** | Secondary implementer | Secondary commands, tools, small refactors |
| **OpenCode** | Tooling & infra | Scripts, sync-types, test infrastructure |
| **Jules** | QA & validation | Contract audit, edge cases, documentation |
| **MiniMax** | Consistency & edge cases | Error mapping review, cross-repo consistency |

---

## 📌 File Ownership Matrix

### pomotask-cli

| File(s) | Owner | Notes |
|---------|-------|-------|
| `src/lib/exitcodes.ts` | OpenHands | Core contract |
| `src/lib/output.ts` | OpenHands | Core contract |
| `src/lib/errors.ts` | OpenHands + MiniMax | OH implements, MiniMax reviews |
| `src/lib/convex.ts` | OpenHands | Core infrastructure |
| `src/lib/index.ts` | OpenHands | Shared utilities |
| `src/index.ts` | OpenHands | Commander wiring |
| `src/commands/task/claim.ts` | OpenHands | Critical path |
| `src/commands/task/progress.ts` | OpenHands | Critical path (normalization) |
| `src/commands/task/complete.ts` | OpenHands | Critical path |
| `src/commands/task/fail.ts` | OpenHands | Critical path |
| `src/commands/task/list.ts` | Cursor | Secondary |
| `src/commands/task/create.ts` | Cursor | Secondary |
| `src/commands/task/comment.ts` | Cursor | Secondary |
| `src/commands/agent/register.ts` | Cursor | Secondary |
| `src/commands/agent/heartbeat.ts` | Cursor | Secondary |
| `src/commands/agent/status.ts` | Cursor | Secondary |
| `scripts/sync-types.mjs` | OpenCode | Infrastructure |
| `tests/*.test.ts` | OpenCode | Test infrastructure + OH adds per-command tests |

### pomotask-mcp

| File(s) | Owner | Notes |
|---------|-------|-------|
| `src/lib/convex.ts` | OpenHands | Core infrastructure |
| `src/lib/errors.ts` | OpenHands + MiniMax | OH implements, MiniMax reviews |
| `src/lib/schemas.ts` | OpenHands | Input/output contracts |
| `src/lib/pomotask.ts` | OpenHands | Shared Convex layer |
| `src/server/mcp.ts` | OpenHands | MCP server wiring |
| `src/index.ts` | OpenHands | Entry point |
| `src/tools/task/claim.ts` | OpenHands | Critical tool |
| `src/tools/task/progress.ts` | OpenHands | Critical tool |
| `src/tools/task/complete.ts` | OpenHands | Critical tool |
| `src/tools/task/fail.ts` | OpenHands | Critical tool |
| `src/tools/task/list.ts` | Cursor | Secondary |
| `src/tools/task/create.ts` | Cursor | Secondary |
| `src/tools/task/comment.ts` | Cursor | Secondary |
| `src/tools/agent/register.ts` | Cursor | Secondary |
| `src/tools/agent/heartbeat.ts` | Cursor | Secondary |
| `src/tools/agent/status.ts` | Cursor | Secondary |
| `scripts/sync-types.mjs` | OpenCode | Infrastructure |
| `tests/*.test.ts` | OpenCode + Jules | Test infra + edge case tests |

### Cross-repo

| File(s) | Owner | Notes |
|---------|-------|-------|
| `.jules/cli.md` | Jules | CLI journal |
| `.jules/mcp.md` | Jules | MCP journal |
| `README.md` (both) | Jules | Documentation |
| `multi-agent-task-plan.md` | Orchestrator | This file |

---

## 🏗️ Execution Phases

### Phase 1 — Contract Validation (Jules + MiniMax)
**Goal**: Ensure the defined contracts are solid before implementation.

| ID | Task | Agent | Depends On | Files Allowed | DoD |
|----|------|-------|------------|---------------|-----|
| F1-01 | Audit CLI contract against `convex-cli-contexto.md` | Jules | None | `.jules/cli.md` | Checklist of conformity + gaps |
| F1-02 | Audit MCP contract against `pomotask-mcp-contexto.md` | Jules | None | `.jules/mcp.md` | Checklist + divergences |
| F1-03 | Build error mapping matrix (CLI exit codes ↔ MCP error codes) | MiniMax | None | `.jules/cli.md`, `.jules/mcp.md` | Matrix complete, signed off |
| F1-04 | Verify no `any`, no `console.log`, no `import.meta.env` in scaffold | Jules | F1-01 | `src/**/*.ts` | Audit report, no violations |

### Phase 2 — Core Base (OpenHands)
**Goal**: Implement the shared infrastructure and critical commands/tools.

| ID | Task | Agent | Depends On | Files Allowed | DoD |
|----|------|-------|------------|---------------|-----|
| F2-01 | Implement `lib/convex.ts` with real ConvexClient init + env validation | OpenHands | F1-01, F1-02 | CLI: `src/lib/convex.ts`, MCP: `src/lib/convex.ts` | Tests pass, exit code 4 on missing env |
| F2-02 | Implement `lib/pomotask.ts` (shared Convex access layer) | OpenHands | F2-01 | MCP: `src/lib/pomotask.ts` | Functions stub-ready for real Convex calls |
| F2-03 | Implement `lib/errors.ts` full error mapping | OpenHands | F2-01 | CLI: `src/lib/errors.ts`, MCP: `src/lib/errors.ts` | All error types tested, `mapError` covers heuristics |
| F2-04 | Implement `lib/exitcodes.ts` + `lib/output.ts` (CLI) | OpenHands | F2-01 | CLI: `src/lib/exitcodes.ts`, `src/lib/output.ts` | stdout/stderr discipline tests pass |
| F2-05 | Implement `lib/schemas.ts` (MCP) | OpenHands | F2-01 | MCP: `src/lib/schemas.ts` | All input/output types defined |
| F2-06 | Implement `task claim` (CLI command) | OpenHands | F2-01, F2-04 | CLI: `src/commands/task/claim.ts`, `src/index.ts` | Returns JSON or `null` + exit 1 |
| F2-07 | Implement `task claim` (MCP tool) | OpenHands | F2-02, F2-05 | MCP: `src/tools/task/claim.ts` | Returns JSON or `null`, errors mapped |
| F2-08 | Implement `task progress` with normalization (CLI) | OpenHands | F2-01, F2-04 | CLI: `src/commands/task/progress.ts` | Normalizes to 1 line, truncates 280 chars |
| F2-09 | Implement `task progress` with normalization (MCP tool) | OpenHands | F2-02, F2-05 | MCP: `src/tools/task/progress.ts` | Same normalization as CLI |
| F2-10 | Implement `task complete` (CLI) | OpenHands | F2-01, F2-04 | CLI: `src/commands/task/complete.ts` | Validates required fields |
| F2-11 | Implement `task complete` (MCP tool) | OpenHands | F2-02, F2-05 | MCP: `src/tools/task/complete.ts` | Same contract as CLI |
| F2-12 | Implement `task fail` (CLI + MCP) | OpenHands | F2-01 | CLI: `src/commands/task/fail.ts`, MCP: `src/tools/task/fail.ts` | Validates reason |
| F2-13 | Implement MCP server base (stdio transport) | OpenHands | F2-07, F2-09 | MCP: `src/server/mcp.ts`, `src/index.ts` | Server starts, tools registered |

### Phase 3 — Expansion (Cursor)
**Goal**: Implement remaining commands and tools.

| ID | Task | Agent | Depends On | Files Allowed | DoD |
|----|------|-------|------------|---------------|-----|
| F3-01 | Implement `task list` (CLI) | Cursor | F2-06 | CLI: `src/commands/task/list.ts` | Filters work, JSON output |
| F3-02 | Implement `task list` (MCP tool) | Cursor | F2-07 | MCP: `src/tools/task/list.ts` | Same contract as CLI |
| F3-03 | Implement `task create` (CLI + MCP) | Cursor | F2-06 | CLI: `src/commands/task/create.ts`, MCP: `src/tools/task/create.ts` | Validates required fields |
| F3-04 | Implement `task comment` (CLI + MCP) | Cursor | F2-06 | CLI: `src/commands/task/comment.ts`, MCP: `src/tools/task/comment.ts` | Validates comment type |
| F3-05 | Implement `agent register` (CLI + MCP) | Cursor | F2-01 | CLI: `src/commands/agent/register.ts`, MCP: `src/tools/agent/register.ts` | Validates name, type, capabilities |
| F3-06 | Implement `agent heartbeat` (CLI + MCP) | Cursor | F2-01 | CLI: `src/commands/agent/heartbeat.ts`, MCP: `src/tools/agent/heartbeat.ts` | Updates lastSeenAt |
| F3-07 | Implement `agent status` (CLI + MCP) | Cursor | F2-01 | CLI: `src/commands/agent/status.ts`, MCP: `src/tools/agent/status.ts` | Returns agent info |

### Phase 4 — Tooling & Tests (OpenCode + Jules)
**Goal**: Build test infrastructure, add comprehensive tests, finalize scripts.

| ID | Task | Agent | Depends On | Files Allowed | DoD |
|----|------|-------|------------|---------------|-----|
| F4-01 | Finalize `sync-types.mjs` (both repos) | OpenCode | F2-01 | `scripts/sync-types.mjs` (both) | Script works, test verifies |
| F4-02 | Set up Vitest fixtures + mocks for ConvexClient | OpenCode | F2-01 | `tests/` (both) | Mock factories reusable |
| F4-03 | Write tests for all CLI commands | OpenCode | F3-07 | CLI: `tests/*.test.ts` | Exit codes, JSON output, stderr isolation |
| F4-04 | Write tests for all MCP tools | OpenCode | F3-07 | MCP: `tests/*.test.ts` | Input validation, error mapping, null handling |
| F4-05 | Write edge case tests for `progress` normalization | OpenCode + Jules | F2-08 | CLI: `tests/normalize.test.ts` | Multiline, unicode, empty, 280+ chars |
| F4-06 | Write edge case tests for `claim` null scenario | OpenCode + Jules | F2-06, F2-07 | Both: `tests/` | Exit code 1 / NO_TASKS code |
| F4-07 | Contract tests: CLI ↔ MCP parity | Jules | F3-07 | Both: `tests/contract*.test.ts` | Same semantics, same error mapping |

### Phase 5 — QA Final (Jules + MiniMax)
**Goal**: Final validation, documentation, release readiness.

| ID | Task | Agent | Depends On | Files Allowed | DoD |
|----|------|-------|------------|---------------|-----|
| F5-01 | Audit restrictions compliance | Jules | F4-03, F4-04 | `src/**/*.ts` (both) | No `any`, no `console.log`, no `import.meta.env`, no `ConvexReactClient` |
| F5-02 | Cross-repo consistency review | MiniMax | F4-07 | Both repos | Error mapping consistent, progress normalization identical |
| F5-03 | Write agent integration guide | Jules | F5-01 | `docs/integration-for-agents.md` (CLI) | Full lifecycle documented |
| F5-04 | Write MCP integration guide | Jules | F5-01 | MCP README | Tools, inputs, outputs, error handling |
| F5-05 | Smoke test against real Convex deployment | OpenHands | F5-01, F5-02 | Both repos | claim/progress/complete/fail/heartbeat all work |
| F5-06 | Release readiness checklist | Jules + MiniMax | F5-05 | Both repos | `pnpm build` ✅ `pnpm test` ✅ docs ✅ `.env.example` ✅ |

---

## ⚠️ Risks

### High Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| **stdout/stderr contamination** | Agents parse wrong stream → silent failures | Jules audits every command; OpenHands runs in Phase 2 with explicit stderr tests |
| **ConvexClient import path wrong** | Build fails at Phase 2 | Already discovered: use `convex/browser` not `convex`. Documented in `.jules/cli.md` |
| **Exit code / error code drift between CLI and MCP** | Agents get inconsistent signals | MiniMax owns cross-repo consistency review (F5-02) |
| **`task claim` null handling** | Agent loops forever or crashes | Phase 2 includes dedicated null tests (F4-06) |

### Medium Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Multiple agents editing same file** | Merge conflicts | File ownership matrix is strict; same-file tasks are sequential |
| **Convex schema changes during development** | Types break | sync-types script + `CONVEX_TIMEOUT_MS` constant for API stability |
| **`any` leaking through Convex generated types** | Type safety compromised | F1-04 audit + tsconfig `noUncheckedIndexedAccess` |
| **esbuild build script not approved** | Vitest may have issues | Already noted; `pnpm approve-builds` needed during setup |

### Low Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Commander.js version mismatch** | CLI parsing differences | Pinned in package.json |
| **MCP SDK breaking changes** | Tool registration fails | Pinned version; test server starts in Phase 2 |

### Sensitive Points Requiring Extra Care

1. **stdout vs stderr separation** — The CLI's output discipline is the most fragile contract. One stray `console.log` breaks agent consumers.
2. **Exit Code 1 (no tasks) vs Exit Code 0 (success)** — Agents must distinguish polling states from real success. `claim` returning `null` with exit 1 is critical.
3. **Progress normalization** — Must be identical in CLI and MCP. 280 char truncation, single line, whitespace collapse.
4. **Timeout 10s** — Both repos must enforce this. Hardcoded constant in both `convex.ts` files.
5. **Env var validation at startup** — Must fail fast with exit code 4 / AGENT_ERROR before any network call.

---

## 📊 Dependency Graph (Summary)

```
F1-01, F1-02, F1-03, F1-04  (parallel — contract validation)
           │
     ┌─────┘
     ▼
   F2-01 (convex.ts)
   ┌─┤├─┐
   ▼ ▼ ▼ ▼
  F2-02 F2-03 F2-04 F2-05  (parallel — libs)
     │     │     │     │
     └─────┴─────┴─────┘
           │
     ┌─────┴─────┐
     ▼           ▼
  F2-06..F2-12  F2-13  (parallel — commands + MCP server)
     │              │
     └──────┬───────┘
            ▼
     F3-01..F3-07  (sequential — secondary commands)
            │
            ▼
     F4-01..F4-07  (test infrastructure + tests)
            │
            ▼
     F5-01..F5-06  (QA + release)
```

---

## 📝 Execution Order (Agent Perspective)

### OpenHands
1. F2-01 → F2-02 → F2-03 → F2-04 → F2-05
2. F2-06 → F2-07 → F2-08 → F2-09 → F2-10 → F2-11 → F2-12 → F2-13
3. F5-05 (smoke test)

### Cursor
1. Wait for F2-06 completion
2. F3-01 → F3-02 → F3-03 → F3-04 → F3-05 → F3-06 → F3-07

### OpenCode
1. Wait for F2-01
2. F4-01 → F4-02
3. Wait for F3-07
4. F4-03 → F4-04 → F4-05 → F4-06

### Jules
1. F1-01 → F1-02 → F1-04 (Phase 1, parallel with F1-03)
2. F4-07 (contract tests, after F3-07)
3. F5-01 → F5-03 → F5-04 → F5-06 (final QA)

### MiniMax
1. F1-03 (error mapping matrix)
2. F5-02 (cross-repo consistency)
3. F5-06 (release readiness, with Jules)

---

## ✅ Current Status

| Item | Status |
|------|--------|
| `pomotask-cli` structure | ✅ Created |
| `pomotask-mcp` structure | ✅ Created |
| `pomotask-cli` compiles | ✅ `tsc` clean |
| `pomotask-mcp` compiles | ✅ `tsc` clean |
| `pomotask-cli` tests | ✅ 12/12 pass |
| `pomotask-mcp` tests | ✅ 5/5 pass |
| No `any` used | ✅ Verified |
| No `console.log` in commands | ✅ Verified |
| `convex/browser` import | ✅ Documented (not `convex`) |
| `sync-types.mjs` (both repos) | ✅ Ready (untested — needs real Pomotask repo) |
| `.jules/cli.md` | ✅ Created |
| `.jules/mcp.md` | ✅ Created |
| `AGENT_cli.md` | ✅ Exists (user-provided) |
| `AGENT_mcp.md` | ✅ Exists (user-provided) |

---

*Generated by orchestrator. Start with Phase 1.*
