import { describe, it, expect } from "vitest";
import { EXIT_CODES } from "../src/lib/exitcodes.js";

describe("EXIT_CODES", () => {
  it("should have correct numeric values", () => {
    expect(EXIT_CODES.SUCCESS).toBe(0);
    expect(EXIT_CODES.NO_TASKS_AVAILABLE).toBe(1);
    expect(EXIT_CODES.NETWORK_ERROR).toBe(2);
    expect(EXIT_CODES.VALIDATION_ERROR).toBe(3);
    expect(EXIT_CODES.INVALID_AGENT_OR_ENV).toBe(4);
  });
});
