import { describe, it, expect } from "vitest";
import { normalizeProgressMessage } from "../src/commands/task/progress.js";

describe("task progress - normalizeProgressMessage", () => {
  it("should normalize to single line", () => {
    const input = "This is\nmultiple\nlines";
    const result = normalizeProgressMessage(input);
    expect(result).toBe("This is multiple lines");
  });

  it("should collapse multiple spaces", () => {
    const input = "Too    many    spaces";
    const result = normalizeProgressMessage(input);
    expect(result).toBe("Too many spaces");
  });

  it("should trim whitespace", () => {
    const input = "  trimmed  ";
    const result = normalizeProgressMessage(input);
    expect(result).toBe("trimmed");
  });

  it("should truncate to 280 chars", () => {
    const input = "A".repeat(300);
    const result = normalizeProgressMessage(input);
    expect(result.length).toBe(280);
    expect(result.endsWith("...")).toBe(true);
  });

  it("should not truncate if under limit", () => {
    const input = "Short message";
    const result = normalizeProgressMessage(input);
    expect(result).toBe("Short message");
  });

  it("should handle empty string", () => {
    const input = "";
    const result = normalizeProgressMessage(input);
    expect(result).toBe("");
  });

  it("should handle custom max length", () => {
    const input = "A".repeat(50);
    const result = normalizeProgressMessage(input, 20);
    expect(result.length).toBe(20);
    expect(result.endsWith("...")).toBe(true);
  });
});