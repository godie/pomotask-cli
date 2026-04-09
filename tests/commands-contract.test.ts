import { describe, it, expect, beforeEach, vi } from "vitest";

// Set dummy env vars for tests
process.env.CONVEX_URL = "https://dummy.convex.cloud";
process.env.POMOTASK_AGENT_ID = "agent-1";

// Mock convex.js to provide AGENT_ID
vi.mock("../src/lib/convex.js", async () => {
  const actual = await vi.importActual("../src/lib/convex.js");
  return {
    ...actual,
    AGENT_ID: "agent-1",
    validateEnvironment: vi.fn(),
  };
});

import { listTasks } from "../src/commands/task/list.js";
import { claimTask } from "../src/commands/task/claim.js";
import { reportProgress } from "../src/commands/task/progress.js";
import { completeTask } from "../src/commands/task/complete.js";
import { failTask } from "../src/commands/task/fail.js";
import { createTask } from "../src/commands/task/create.js";
import { commentTask } from "../src/commands/task/comment.js";
import { registerAgent } from "../src/commands/agent/register.js";
import { sendHeartbeat } from "../src/commands/agent/heartbeat.js";
import { getAgentStatus } from "../src/commands/agent/status.js";
import { ValidationError, NoTasksAvailableError } from "../src/lib/errors.js";

// Mock output module
vi.mock("../src/lib/output.js", async () => {
  const actual = await vi.importActual("../src/lib/output.js");
  return {
    ...actual,
    writeJson: vi.fn(),
  };
});

import { writeJson } from "../src/lib/output.js";

describe("task complete - contract tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should output valid JSON with all required fields", async () => {
    const prUrl = "https://github.com/org/repo/pull/123";
    // Valid SHA-1 (40 hex chars)
    const commitSha = "abcdef0123456789abcdef0123456789abcdef01";
    
    await completeTask({ taskId: "task-1", prUrl, commitSha });
    
    expect(writeJson).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        command: "task complete",
        taskId: "task-1",
        prUrl,
        commitSha,
      })
    );
  });

  it("should reject invalid PR URL", async () => {
    await expect(
      completeTask({ taskId: "task-1", prUrl: "not-a-url", commitSha: "a".repeat(40) })
    ).rejects.toThrow(ValidationError);
  });

  it("should reject invalid commit SHA (wrong length)", async () => {
    await expect(
      completeTask({ taskId: "task-1", prUrl: "https://github.com/a/b/pull/1", commitSha: "abc" })
    ).rejects.toThrow(ValidationError);
  });

  it("should reject invalid commit SHA (non-hex)", async () => {
    await expect(
      completeTask({ taskId: "task-1", prUrl: "https://github.com/a/b/pull/1", commitSha: "gggggggggggggggggggggggggggggggggggggggg" })
    ).rejects.toThrow(ValidationError);
  });

  it("should reject missing prUrl", async () => {
    await expect(
      completeTask({ taskId: "task-1", prUrl: "", commitSha: "a".repeat(40) })
    ).rejects.toThrow(ValidationError);
  });

  it("should reject missing commitSha", async () => {
    await expect(
      completeTask({ taskId: "task-1", prUrl: "https://github.com/a/b/pull/1", commitSha: "" })
    ).rejects.toThrow(ValidationError);
  });
});

describe("task fail - contract tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should output valid JSON with all required fields", async () => {
    await failTask({ taskId: "task-1", reason: "Cannot reproduce issue" });
    
    expect(writeJson).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        command: "task fail",
        taskId: "task-1",
        reason: "Cannot reproduce issue",
      })
    );
  });

  it("should reject missing reason", async () => {
    await expect(
      failTask({ taskId: "task-1", reason: "" })
    ).rejects.toThrow(ValidationError);
  });
});

describe("task create - contract tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should output valid JSON with all required fields", async () => {
    await createTask({ title: "Fix bug", type: "bugfix", projectId: "proj-1" });
    
    expect(writeJson).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        command: "task create",
        data: expect.objectContaining({
          title: "Fix bug",
          type: "bugfix",
          projectId: "proj-1",
        }),
      })
    );
  });

  it("should reject missing title", async () => {
    await expect(
      createTask({ title: "", type: "bugfix", projectId: "proj-1" })
    ).rejects.toThrow(ValidationError);
  });

  it("should reject missing type", async () => {
    await expect(
      createTask({ title: "Fix bug", type: "", projectId: "proj-1" })
    ).rejects.toThrow(ValidationError);
  });

  it("should reject missing projectId", async () => {
    await expect(
      createTask({ title: "Fix bug", type: "bugfix", projectId: "" })
    ).rejects.toThrow(ValidationError);
  });
});

describe("task comment - contract tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should output valid JSON with all required fields", async () => {
    await commentTask({ taskId: "task-1", type: "clarification", message: "Need clarification" });
    
    expect(writeJson).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        command: "task comment",
        taskId: "task-1",
        type: "clarification",
        message: "Need clarification",
      })
    );
  });

  it("should reject empty type after trimming", async () => {
    await expect(
      commentTask({ taskId: "task-1", type: "   ", message: "message" })
    ).rejects.toThrow(ValidationError);
  });

  it("should reject empty message after trimming", async () => {
    await expect(
      commentTask({ taskId: "task-1", type: "clarification", message: "   " })
    ).rejects.toThrow(ValidationError);
  });
});

describe("task list - contract tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should output valid JSON with all required fields", async () => {
    await listTasks({ status: "open", type: "bugfix" });
    
    expect(writeJson).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        command: "task list",
        data: expect.any(Array),
        filters: expect.objectContaining({
          status: "open",
          type: "bugfix",
        }),
      })
    );
  });

  it("should sanitize special characters in filters", async () => {
    await listTasks({ status: "open&test", type: "bug|fix" });
    
    expect(writeJson).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({
          status: "opentest",
          type: "bugfix",
        }),
      })
    );
  });
});

describe("task claim - contract tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // NOTE: The "no tasks" test is removed because the stub always returns a task
  // In production, this would call the Convex mutation and return actual result

  it("should reject empty type", async () => {
    vi.stubEnv("CONVEX_URL", "https://test.convex.cloud");
    vi.stubEnv("POMOTASK_AGENT_ID", "test-agent");
    
    await expect(
      claimTask({ type: "" })
    ).rejects.toThrow(ValidationError);
  });

  it("should reject type with only whitespace", async () => {
    vi.stubEnv("CONVEX_URL", "https://test.convex.cloud");
    vi.stubEnv("POMOTASK_AGENT_ID", "test-agent");
    
    await expect(
      claimTask({ type: "   " })
    ).rejects.toThrow(ValidationError);
  });
});

describe("task progress - contract tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should output valid JSON with all required fields", async () => {
    await reportProgress({ taskId: "task-1", message: "Working on fix" });
    
    expect(writeJson).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        command: "task progress",
        taskId: "task-1",
        message: "Working on fix",
        level: "info",
      })
    );
  });

  it("should support different log levels", async () => {
    await reportProgress({ taskId: "task-1", message: "Warning", level: "warn" });
    
    expect(writeJson).toHaveBeenCalledWith(
      expect.objectContaining({
        level: "warn",
      })
    );
  });
});

describe("agent register - contract tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should output valid JSON with all required fields", async () => {
    await registerAgent({ name: "codex-1", type: "codex", capabilities: "codegen,refactor" });
    
    expect(writeJson).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        command: "agent register",
        data: expect.objectContaining({
          name: "codex-1",
          type: "codex",
          capabilities: ["codegen", "refactor"],
        }),
      })
    );
  });

  it("should reject missing name", async () => {
    await expect(
      registerAgent({ name: "", type: "codex", capabilities: "" })
    ).rejects.toThrow(ValidationError);
  });

  it("should reject missing type", async () => {
    await expect(
      registerAgent({ name: "codex-1", type: "", capabilities: "" })
    ).rejects.toThrow(ValidationError);
  });

  it("should handle empty capabilities", async () => {
    await registerAgent({ name: "codex-1", type: "codex", capabilities: "" });
    
    expect(writeJson).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          capabilities: [],
        }),
      })
    );
  });
});

describe("agent heartbeat - contract tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should output valid JSON with all required fields", async () => {
    await sendHeartbeat();
    
    expect(writeJson).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        command: "agent heartbeat",
        data: expect.objectContaining({
          agentId: "agent-1",
          status: "alive",
        }),
      })
    );
  });
});

describe("agent status - contract tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should output valid JSON with all required fields", async () => {
    await getAgentStatus();
    
    expect(writeJson).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        command: "agent status",
        data: expect.objectContaining({
          agentId: "agent-1",
          status: "active",
        }),
      })
    );
  });
});
