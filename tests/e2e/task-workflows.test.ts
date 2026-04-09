/**
 * E2E Tests: Task Workflows
 * 
 * Tests the complete task lifecycle: claim → progress → complete/fail
 * 
 * These tests can run against:
 * 1. A real Convex deployment (set CONVEX_URL and POMOTASK_AGENT_ID)
 * 2. The built CLI binary with stubbed responses
 * 
 * Requirements for real deployment:
 * - CONVEX_URL must point to a valid Convex deployment
 * - POMOTASK_AGENT_ID must be a registered agent
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { CliResult, parseJsonOutput, parseJsonOutputAs, runCli, TEST_ENV } from "./helpers.js";
import { MockConvexServer } from "./mock-convex-server.js";

interface TaskClaimOutput {
  ok: boolean;
  command: string;
  id?: string;
  title?: string;
  type?: string;
  projectId?: string;
  branchName?: string;
  baseBranch?: string;
}

interface TaskProgressOutput {
  ok: boolean;
  command: string;
  taskId: string;
  message: string;
  level: string;
}

interface TaskCompleteOutput {
  ok: boolean;
  command: string;
  taskId: string;
  prUrl: string;
  commitSha: string;
}

interface TaskFailOutput {
  ok: boolean;
  command: string;
  taskId: string;
  reason: string;
}

interface TaskListOutput {
  ok: boolean;
  command: string;
  data: unknown[];
  filters: Record<string, string>;
}

interface TaskCreateOutput {
  ok: boolean;
  command: string;
  data: {
    title: string;
    type: string;
    projectId: string;
  };
}

interface TaskCommentOutput {
  ok: boolean;
  command: string;
  taskId: string;
  type: string;
  message: string;
}

const CLI_PATH = "./dist/index.js";

describe("task claim - E2E", () => {
  describe("when tasks are available", () => {
    it("should claim a task and return task details with exit code 0", async () => {
      const result = await runCli(["task", "claim", "--type", "bugfix"], {
        env: TEST_ENV,
      });

      expect(result.exitCode).toBe(0);

      const output = parseJsonOutput(result.stdout);
      expect(output).toMatchObject({
        ok: true,
        command: "task claim",
      });

      // Should have task details
      expect(output).toHaveProperty("id");
      expect(output).toHaveProperty("title");
      expect(output).toHaveProperty("type", "bugfix");
      expect(output).toHaveProperty("projectId");
      expect(output).toHaveProperty("branchName");
      expect(output).toHaveProperty("baseBranch");
    });
  });

  describe("when no tasks are available", () => {
    // NOTE: This test is disabled because the current stub implementation
    // always returns a task. In production, this would call Convex mutation.
    // The test remains here as documentation of expected behavior.
    it.skip("should return null and exit code 1 (pending Convex integration)", async () => {
      const result = await runCli(["task", "claim", "--type", "nonexistent"], {
        env: { ...TEST_ENV, POMOTASK_SIMULATE_NO_TASKS: "true" },
      });

      // Exit code 1: No tasks available
      expect(result.exitCode).toBe(1);

      // Should have error message in stderr (logged by error handler)
      expect(result.stderr).toContain("No tasks available");
    });
  });

  describe("validation errors", () => {
    it("should reject empty type with exit code 3", async () => {
      const result = await runCli(["task", "claim", "--type", ""], {
        env: TEST_ENV,
      });

      expect(result.exitCode).toBe(3);
      expect(result.stderr).toContain("--type is required");
    });

    it("should reject whitespace-only type with exit code 3", async () => {
      const result = await runCli(["task", "claim", "--type", "   "], {
        env: TEST_ENV,
      });

      expect(result.exitCode).toBe(3);
    });
  });

  describe("environment validation", () => {
    it("should exit with code 4 when CONVEX_URL is missing", async () => {
      const result = await runCli(["task", "claim", "--type", "bugfix"], {
        env: { POMOTASK_AGENT_ID: "agent-1" },
      });

      expect(result.exitCode).toBe(4);
      expect(result.stderr).toContain("CONVEX_URL is required");
    });

    it("should exit with code 4 when POMOTASK_AGENT_ID is missing", async () => {
      const result = await runCli(["task", "claim", "--type", "bugfix"], {
        env: { CONVEX_URL: "https://test.convex.cloud" },
      });

      expect(result.exitCode).toBe(4);
      expect(result.stderr).toContain("POMOTASK_AGENT_ID is required");
    });
  });
});

describe("task progress - E2E", () => {
  describe("happy path", () => {
    it("should report progress with default level info and exit code 0", async () => {
      const result = await runCli(
        ["task", "progress", "task-123", "Working on fix"],
        { env: TEST_ENV }
      );

      expect(result.exitCode).toBe(0);

      const output = parseJsonOutput(result.stdout);
      expect(output).toMatchObject({
        ok: true,
        command: "task progress",
        taskId: "task-123",
        message: "Working on fix",
        level: "info",
      });
    });

    it("should support warn level", async () => {
      const result = await runCli(
        [
          "task",
          "progress",
          "task-123",
          "Warning: may break",
          "--level",
          "warn",
        ],
        { env: TEST_ENV }
      );

      expect(result.exitCode).toBe(0);

      const output = parseJsonOutput(result.stdout);
      expect(output.level).toBe("warn");
    });

    it("should support error level", async () => {
      const result = await runCli(
        [
          "task",
          "progress",
          "task-123",
          "Error: blocked",
          "--level",
          "error",
        ],
        { env: TEST_ENV }
      );

      expect(result.exitCode).toBe(0);

      const output = parseJsonOutput(result.stdout);
      expect(output.level).toBe("error");
    });
  });

  describe("message normalization (from J-03 edge cases)", () => {
    it("should collapse multiline message to single line", async () => {
      const multilineMessage = "Line 1\nLine 2\nLine 3";
      const result = await runCli(
        ["task", "progress", "task-123", multilineMessage],
        { env: TEST_ENV }
      );

      expect(result.exitCode).toBe(0);

      const output = parseJsonOutput(result.stdout);
      expect(output.message).not.toContain("\n");
      expect(output.message).toContain(" ");
    });

    it("should collapse multiple spaces to single space", async () => {
      const multiSpaceMessage = "Word1    Word2    Word3";
      const result = await runCli(
        ["task", "progress", "task-123", multiSpaceMessage],
        { env: TEST_ENV }
      );

      expect(result.exitCode).toBe(0);

      const output = parseJsonOutput(result.stdout);
      expect(output.message).toBe("Word1 Word2 Word3");
    });

    it("should truncate message longer than 280 characters", async () => {
      const longMessage = "A".repeat(500);
      const result = await runCli(
        ["task", "progress", "task-123", longMessage],
        { env: TEST_ENV }
      );

      expect(result.exitCode).toBe(0);

      const output = parseJsonOutput(result.stdout);
      expect(output.message.length).toBe(280);
      expect(output.message.endsWith("...")).toBe(true);
    });

    it("should handle unicode in message", async () => {
      const unicodeMessage = "Hello 🌍! Working on: 问题";
      const result = await runCli(
        ["task", "progress", "task-123", unicodeMessage],
        { env: TEST_ENV }
      );

      expect(result.exitCode).toBe(0);

      const output = parseJsonOutput(result.stdout);
      expect(output.message).toContain("🌍");
      expect(output.message).toContain("问题");
    });
  });

  describe("validation errors", () => {
    it("should reject missing task-id", async () => {
      const result = await runCli(
        ["task", "progress", "--message", "test"],
        { env: TEST_ENV }
      );

      expect(result.exitCode).toBe(3);
    });

    it("should reject missing message", async () => {
      const result = await runCli(
        ["task", "progress", "--task-id", "task-123"],
        { env: TEST_ENV }
      );

      expect(result.exitCode).toBe(3);
    });
  });
});

describe("task complete - E2E", () => {
  const validPrUrl = "https://github.com/org/repo/pull/123";
  const validCommitSha = "abcdef0123456789abcdef0123456789abcdef01";

  describe("happy path", () => {
    it("should complete task with valid PR URL and commit SHA", async () => {
      const result = await runCli(
        [
          "task",
          "complete",
          "task-123",
          "--pr-url",
          validPrUrl,
          "--commit-sha",
          validCommitSha,
        ],
        { env: TEST_ENV }
      );

      expect(result.exitCode).toBe(0);

      const output = parseJsonOutput(result.stdout);
      expect(output).toMatchObject({
        ok: true,
        command: "task complete",
        taskId: "task-123",
        prUrl: validPrUrl,
        commitSha: validCommitSha,
      });
    });
  });

  describe("validation errors (from J-03)", () => {
    it("should reject invalid PR URL with exit code 3", async () => {
      const result = await runCli(
        [
          "task",
          "complete",
          "task-123",
          "--pr-url",
          "not-a-url",
          "--commit-sha",
          validCommitSha,
        ],
        { env: TEST_ENV }
      );

      expect(result.exitCode).toBe(3);
      expect(result.stderr).toContain("Invalid PR URL");
    });

    it("should reject invalid commit SHA length with exit code 3", async () => {
      const result = await runCli(
        [
          "task",
          "complete",
          "task-123",
          "--pr-url",
          validPrUrl,
          "--commit-sha",
          "abc123",
        ],
        { env: TEST_ENV }
      );

      expect(result.exitCode).toBe(3);
      expect(result.stderr).toContain("Invalid commit SHA");
    });

    it("should reject non-hex commit SHA with exit code 3", async () => {
      const result = await runCli(
        [
          "task",
          "complete",
          "task-123",
          "--pr-url",
          validPrUrl,
          "--commit-sha",
          "gggggggggggggggggggggggggggggggggggggggg",
        ],
        { env: TEST_ENV }
      );

      expect(result.exitCode).toBe(3);
      expect(result.stderr).toContain("Invalid commit SHA");
    });

    it("should reject missing pr-url", async () => {
      const result = await runCli(
        [
          "task",
          "complete",
          "--task-id",
          "task-123",
          "--commit-sha",
          validCommitSha,
        ],
        { env: TEST_ENV }
      );

      expect(result.exitCode).toBe(3);
    });

    it("should reject missing commit-sha", async () => {
      const result = await runCli(
        ["task", "complete", "--task-id", "task-123", "--pr-url", validPrUrl],
        { env: TEST_ENV }
      );

      expect(result.exitCode).toBe(3);
    });
  });
});

describe("task fail - E2E", () => {
  describe("happy path", () => {
    it("should fail task with reason", async () => {
      const result = await runCli(
        [
          "task",
          "fail",
          "task-123",
          "--reason",
          "Cannot reproduce issue",
        ],
        { env: TEST_ENV }
      );

      expect(result.exitCode).toBe(0);

      const output = parseJsonOutput(result.stdout);
      expect(output).toMatchObject({
        ok: true,
        command: "task fail",
        taskId: "task-123",
        reason: "Cannot reproduce issue",
      });
    });
  });

  describe("validation errors (from J-03)", () => {
    it("should reject empty reason with exit code 3", async () => {
      const result = await runCli(
        ["task", "fail", "task-123", "--reason", ""],
        { env: TEST_ENV }
      );

      expect(result.exitCode).toBe(3);
      expect(result.stderr).toContain("--reason is required");
    });

    it("should reject missing task-id", async () => {
      const result = await runCli(
        ["task", "fail", "--reason", "Some reason"],
        { env: TEST_ENV }
      );

      expect(result.exitCode).toBe(3);
    });

    it("should reject missing reason", async () => {
      const result = await runCli(
        ["task", "fail", "task-123"],
        { env: TEST_ENV }
      );

      expect(result.exitCode).toBe(3);
    });
  });
});

describe("task list - E2E", () => {
  describe("happy path", () => {
    it("should list tasks with filters", async () => {
      const result = await runCli(
        ["task", "list", "--status", "open", "--type", "bugfix"],
        { env: TEST_ENV }
      );

      expect(result.exitCode).toBe(0);

      const output = parseJsonOutput(result.stdout);
      expect(output).toMatchObject({
        ok: true,
        command: "task list",
      });
      expect(Array.isArray(output.data)).toBe(true);
      expect(output.filters).toMatchObject({
        status: "open",
        type: "bugfix",
      });
    });

    it("should return empty array when no tasks", async () => {
      const result = await runCli(
        ["task", "list", "--status", "closed"],
        { env: TEST_ENV }
      );

      expect(result.exitCode).toBe(0);

      const output = parseJsonOutput(result.stdout);
      expect(output.data).toEqual([]);
    });
  });

  describe("filter sanitization (from J-03)", () => {
    it("should sanitize special characters in filters", async () => {
      const result = await runCli(
        ["task", "list", "--status", "open&test", "--type", "bug|fix"],
        { env: TEST_ENV }
      );

      expect(result.exitCode).toBe(0);

      const output = parseJsonOutput(result.stdout);
      expect(output.filters.status).toBe("opentest");
      expect(output.filters.type).toBe("bugfix");
    });
  });
});

describe("task create - E2E", () => {
  describe("happy path", () => {
    it("should create a task with required fields", async () => {
      const result = await runCli(
        [
          "task",
          "create",
          "--title",
          "Fix bug in auth",
          "--type",
          "bugfix",
          "--project",
          "proj-1",
        ],
        { env: TEST_ENV }
      );

      expect(result.exitCode).toBe(0);

      const output = parseJsonOutput(result.stdout);
      expect(output).toMatchObject({
        ok: true,
        command: "task create",
        data: {
          title: "Fix bug in auth",
          type: "bugfix",
          projectId: "proj-1",
        },
      });
    });
  });

  describe("validation errors", () => {
    it("should reject missing title", async () => {
      const result = await runCli(
        ["task", "create", "--type", "bugfix", "--project-id", "proj-1"],
        { env: TEST_ENV }
      );

      expect(result.exitCode).toBe(3);
    });

    it("should reject missing type", async () => {
      const result = await runCli(
        ["task", "create", "--title", "Fix bug", "--project-id", "proj-1"],
        { env: TEST_ENV }
      );

      expect(result.exitCode).toBe(3);
    });

    it("should reject missing project-id", async () => {
      const result = await runCli(
        ["task", "create", "--title", "Fix bug", "--type", "bugfix"],
        { env: TEST_ENV }
      );

      expect(result.exitCode).toBe(3);
    });
  });
});

describe("task comment - E2E", () => {
  describe("happy path", () => {
    it("should add a comment to a task", async () => {
      const result = await runCli(
        [
          "task",
          "comment",
          "task-123",
          "--type",
          "clarification",
          "--message",
          "Need more details",
        ],
        { env: TEST_ENV }
      );

      expect(result.exitCode).toBe(0);

      const output = parseJsonOutput(result.stdout);
      expect(output).toMatchObject({
        ok: true,
        command: "task comment",
        taskId: "task-123",
        type: "clarification",
        message: "Need more details",
      });
    });
  });

  describe("validation errors (from J-03)", () => {
    it("should reject empty message with exit code 3", async () => {
      const result = await runCli(
        [
          "task",
          "comment",
          "task-123",
          "--type",
          "clarification",
          "--message",
          "   ",
        ],
        { env: TEST_ENV }
      );

      expect(result.exitCode).toBe(3);
    });

    it("should reject empty type with exit code 3", async () => {
      const result = await runCli(
        [
          "task",
          "comment",
          "task-123",
          "--type",
          "   ",
          "--message",
          "Some message",
        ],
        { env: TEST_ENV }
      );

      expect(result.exitCode).toBe(3);
    });
  });
});
