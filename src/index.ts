#!/usr/bin/env node

import { Command } from "commander";
import { writeStderr, writeJson } from "./lib/output.js";
import { mapError } from "./lib/errors.js";

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
  .action(async () => {
    writeJson({ ok: true, command: "task list", data: null });
  });

task
  .command("claim")
  .description("Claim an available task")
  .requiredOption("--type <type>", "Task type to claim")
  .option("--format <format>", "Output format (json|human)", "json")
  .action(async () => {
    writeJson({ ok: true, command: "task claim", data: null });
  });

task
  .command("progress <taskId> <message>")
  .description("Report progress on a task")
  .option("--level <level>", "Progress level (info|warn|error)", "info")
  .action(async (taskId: string, message: string) => {
    writeJson({ ok: true, command: "task progress", taskId, message });
  });

task
  .command("complete <taskId>")
  .description("Mark a task as completed")
  .requiredOption("--pr-url <url>", "Pull request URL")
  .requiredOption("--commit-sha <sha>", "Commit SHA")
  .action(async (taskId: string) => {
    writeJson({ ok: true, command: "task complete", taskId });
  });

task
  .command("fail <taskId>")
  .description("Mark a task as failed")
  .requiredOption("--reason <reason>", "Failure reason")
  .action(async (taskId: string) => {
    writeJson({ ok: true, command: "task fail", taskId });
  });

task
  .command("create")
  .description("Create a new task")
  .requiredOption("--title <title>", "Task title")
  .requiredOption("--type <type>", "Task type")
  .requiredOption("--project <projectId>", "Project ID")
  .action(async () => {
    writeJson({ ok: true, command: "task create", data: null });
  });

task
  .command("comment <taskId>")
  .description("Add a comment to a task")
  .requiredOption("--type <type>", "Comment type")
  .requiredOption("--message <message>", "Comment message")
  .action(async (taskId: string) => {
    writeJson({ ok: true, command: "task comment", taskId });
  });

// ── agent ─────────────────────────────────────────────────────────────

const agent = program.command("agent").description("Agent operations");

agent
  .command("register")
  .description("Register a new agent")
  .requiredOption("--name <name>", "Agent name")
  .requiredOption("--type <type>", "Agent type")
  .requiredOption("--capabilities <caps>", "Comma-separated capabilities")
  .action(async () => {
    writeJson({ ok: true, command: "agent register", data: null });
  });

agent
  .command("heartbeat")
  .description("Send agent heartbeat")
  .action(async () => {
    writeJson({ ok: true, command: "agent heartbeat", data: null });
  });

agent
  .command("status")
  .description("Get agent status")
  .action(async () => {
    writeJson({ ok: true, command: "agent status", data: null });
  });

// ── run ───────────────────────────────────────────────────────────────

program.parseAsync(process.argv).catch((err) => {
  const mapped = mapError(err);
  writeStderr(mapped.message);
  process.exit(mapped.exitCode);
});
