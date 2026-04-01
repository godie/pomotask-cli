import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { writeJson, writeStderr, formatHuman } from "../src/lib/output.js";

describe("output.ts", () => {
  let stdoutWrite: ReturnType<typeof vi.spyOn>;
  let stderrWrite: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stdoutWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    stderrWrite = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutWrite.mockRestore();
    stderrWrite.mockRestore();
  });

  describe("writeJson", () => {
    it("should write JSON to stdout with newline", () => {
      writeJson({ ok: true, data: "test" });
      expect(process.stdout.write).toHaveBeenCalledWith(
        JSON.stringify({ ok: true, data: "test" }, null, 2) + "\n",
      );
    });

    it("should handle null data", () => {
      writeJson(null);
      expect(process.stdout.write).toHaveBeenCalledWith("null\n");
    });

    it("should handle arrays", () => {
      writeJson([1, 2, 3]);
      expect(process.stdout.write).toHaveBeenCalledWith(
        JSON.stringify([1, 2, 3], null, 2) + "\n",
      );
    });
  });

  describe("writeStderr", () => {
    it("should write message to stderr with newline", () => {
      writeStderr("Error message");
      expect(process.stderr.write).toHaveBeenCalledWith("Error message\n");
    });

    it("should handle empty string", () => {
      writeStderr("");
      expect(process.stderr.write).toHaveBeenCalledWith("\n");
    });
  });

  describe("formatHuman", () => {
    it("should format data as pretty JSON", () => {
      const result = formatHuman({ key: "value" });
      expect(result).toBe(JSON.stringify({ key: "value" }, null, 2));
    });

    it("should handle primitive values", () => {
      expect(formatHuman("string")).toBe('"string"');
      expect(formatHuman(42)).toBe("42");
      expect(formatHuman(true)).toBe("true");
    });
  });
});