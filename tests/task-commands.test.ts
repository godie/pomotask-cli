import { describe, it, expect } from "vitest";
import { mapError } from "../src/lib/errors.js";
import { NoTasksAvailableError, NetworkError, ValidationError, InvalidAgentError } from "../src/lib/errors.js";

describe("task claim - exit code 1 when no tasks", () => {
  it("should throw NoTasksAvailableError which maps to exit code 1", () => {
    const error = new NoTasksAvailableError();
    expect(error.exitCode).toBe(1);
  });

  it("should map NoTasksAvailableError correctly", () => {
    const error = new NoTasksAvailableError();
    const mapped = mapError(error);
    expect(mapped.exitCode).toBe(1);
    expect(mapped.message).toBe("No tasks available");
  });
});

describe("task commands error handling", () => {
  it("NetworkError should map to exit code 2", () => {
    const error = new NetworkError("timeout");
    const mapped = mapError(error);
    expect(mapped.exitCode).toBe(2);
  });

  it("ValidationError should map to exit code 3", () => {
    const error = new ValidationError("missing required option");
    const mapped = mapError(error);
    expect(mapped.exitCode).toBe(3);
  });

  it("InvalidAgentError should map to exit code 4", () => {
    const error = new InvalidAgentError("invalid agent");
    const mapped = mapError(error);
    expect(mapped.exitCode).toBe(4);
  });
});