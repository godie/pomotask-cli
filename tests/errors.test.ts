import { describe, it, expect } from "vitest";
import {
  PomotaskCliError,
  NoTasksAvailableError,
  NetworkError,
  ValidationError,
  InvalidAgentError,
  mapError,
} from "../src/lib/errors.js";
import { EXIT_CODES } from "../src/lib/exitcodes.js";

describe("PomotaskCliError", () => {
  it("should store exit code", () => {
    const err = new PomotaskCliError("test", EXIT_CODES.VALIDATION_ERROR);
    expect(err.exitCode).toBe(3);
    expect(err.message).toBe("test");
  });
});

describe("mapError", () => {
  it("should pass through PomotaskCliError instances", () => {
    const original = new NetworkError("timeout");
    const mapped = mapError(original);
    expect(mapped).toBe(original);
  });

  it("should map network-related strings to NetworkError", () => {
    const mapped = mapError(new Error("fetch failed"));
    expect(mapped).toBeInstanceOf(NetworkError);
  });

  it("should map ECONNREFUSED to NetworkError", () => {
    const mapped = mapError(new Error("ECONNREFUSED 127.0.0.1"));
    expect(mapped).toBeInstanceOf(NetworkError);
  });

  it("should map unknown errors to NetworkError (safe default)", () => {
    const mapped = mapError("something broke");
    expect(mapped).toBeInstanceOf(NetworkError);
  });
});
