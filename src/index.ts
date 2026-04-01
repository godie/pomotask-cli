#!/usr/bin/env node

import { Command } from "commander";
import { writeStderr } from "./lib/output.js";
import { mapError } from "./lib/errors.js";
import { listTasks } from "./commands/task/list.js";
import { claimTask } from "./commands/task/claim.js";
import { reportProgress } from "./commands/task/progress.js";
import { completeTask } from "./commands/task/complete.js";
import { failTask } from "./commands/task/fail.js";
import { createTask } from "./commands/task/create.js";
import { commentTask } from "./commands/task/comment.js";
import { registerAgent } from "./commands/agent/register.js";
import { sendHeartbeat } from "./commands/agent/heartbeat.js";
import { getAgentStatus } from "./commands/agent/status.js";

const program = new Command();

program
  .name("pomotask")
  .description("Pomotask CLI — agent interface for task management")
  .version("0.0.1");

// ── task ──────────────────────────────────────────────────────────────

const task = program.command("task").description("Task operations");

task
  .command("list")
  .description("List tasks")
  .option("--status <status>", "Filter by status")
  .option("--type <type>", "Filter by type")
  .option("--format <format>", "Output format (json|human)", "json")
  .action(async (opts) => {
    await listTasks({ status: opts.status, type: opts.type });
  });

task
  .command("claim")
  .description("Claim an available task")
  .requiredOption("--type <type>", "Task type to claim")
  .option("--format <format>", "Output format (json|human)", "json")
  .action(async (opts) => {
    await claimTask({ type: opts.type });
  });

task
  .command("progress <taskId> <message>")
  .description("Report progress on a task")
  .option("--level <level>", "Progress level (info|warn|error)", "info")
  .action(async (taskId: string, message: string, opts) => {
    await reportProgress({ taskId, message, level: opts.level });
  });

task
  .command("complete <taskId>")
  .description("Mark a task as completed")
  .requiredOption("--pr-url <url>", "Pull request URL")
  .requiredOption("--commit-sha <sha>", "Commit SHA")
  .action(async (taskId: string, opts) => {
    await completeTask({ taskId, prUrl: opts.prUrl, commitSha: opts.commitSha });
  });

task
  .command("fail <taskId>")
  .description("Mark a task as failed")
  .requiredOption("--reason <reason>", "Failure reason")
  .action(async (taskId: string, opts) => {
    await failTask({ taskId, reason: opts.reason });
  });

task
  .command("create")
  .description("Create a new task")
  .requiredOption("--title <title>", "Task title")
  .requiredOption("--type <type>", "Task type")
  .requiredOption("--project <projectId>", "Project ID")
  .action(async (opts) => {
    await createTask({ title: opts.title, type: opts.type, projectId: opts.project });
  });

task
  .command("comment <taskId>")
  .description("Add a comment to a task")
  .requiredOption("--type <type>", "Comment type")
  .requiredOption("--message <message>", "Comment message")
  .action(async (taskId: string, opts) => {
    await commentTask({ taskId, type: opts.type, message: opts.message });
  });

// ── agent ─────────────────────────────────────────────────────────────

const agent = program.command("agent").description("Agent operations");

agent
  .command("register")
  .description("Register a new agent")
  .requiredOption("--name <name>", "Agent name")
  .requiredOption("--type <type>", "Agent type")
  .option("--capabilities <caps>", "Comma-separated capabilities")
  .action(async (opts) => {
    await registerAgent({ name: opts.name, type: opts.type, capabilities: opts.capabilities || "" });
  });

agent
  .command("heartbeat")
  .description("Send agent heartbeat")
  .action(async () => {
    await sendHeartbeat();
  });

agent
  .command("status")
  .description("Get agent status")
  .action(async () => {
    await getAgentStatus();
  });

// ── run ───────────────────────────────────────────────────────────────

program.parseAsync(process.argv).catch((err) => {
  const mapped = mapError(err);
  writeStderr(mapped.message);
  process.exit(mapped.exitCode);
});
