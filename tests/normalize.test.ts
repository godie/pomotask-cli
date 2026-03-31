import { describe, it, expect } from "vitest";
import { normalizeProgressMessage } from "../src/lib/index.js";

describe("normalizeProgressMessage", () => {
  it("should collapse whitespace", () => {
    expect(normalizeProgressMessage("hello   world")).toBe("hello world");
  });

  it("should collapse newlines into spaces", () => {
    expect(normalizeProgressMessage("line1\nline2\nline3")).toBe(
      "line1 line2 line3",
    );
  });

  it("should trim leading/trailing whitespace", () => {
    expect(normalizeProgressMessage("  hello  ")).toBe("hello");
  });

  it("should truncate to 280 characters", () => {
    const long = "a".repeat(300);
    const result = normalizeProgressMessage(long);
    expect(result.length).toBe(280);
  });

  it("should pass short messages through unchanged", () => {
    expect(normalizeProgressMessage("ok")).toBe("ok");
  });

  it("should handle empty string", () => {
    expect(normalizeProgressMessage("")).toBe("");
  });
});
