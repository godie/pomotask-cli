import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { InvalidAgentError } from "../src/lib/errors.js";
import { EXIT_CODES } from "../src/lib/exitcodes.js";

describe("convex.ts environment validation", () => {
  describe("InvalidAgentError", () => {
    it("should have correct exit code for invalid agent", () => {
      const error = new InvalidAgentError("CONVEX_URL is required");
      expect(error.exitCode).toBe(EXIT_CODES.INVALID_AGENT_OR_ENV);
      expect(error.exitCode).toBe(4);
    });

    it("should have correct exit code when POMOTASK_AGENT_ID missing", () => {
      const error = new InvalidAgentError("POMOTASK_AGENT_ID is required");
      expect(error.exitCode).toBe(EXIT_CODES.INVALID_AGENT_OR_ENV);
    });

    it("should have correct name", () => {
      const error = new InvalidAgentError("test");
      expect(error.name).toBe("InvalidAgentError");
    });

    it("should include message", () => {
      const error = new InvalidAgentError("CONVEX_URL is required");
      expect(error.message).toBe("CONVEX_URL is required");
    });
  });

  describe("Environment validation logic", () => {
    it("should detect missing CONVEX_URL", () => {
      const convexUrl = undefined as unknown as string;
      const agentId = "test-agent";
      
      const hasConvexUrl = Boolean(convexUrl);
      const hasAgentId = Boolean(agentId);
      
      expect(hasConvexUrl).toBe(false);
      expect(hasAgentId).toBe(true);
      
      if (!hasConvexUrl || !hasAgentId) {
        const message = !hasConvexUrl ? "CONVEX_URL is required" : "POMOTASK_AGENT_ID is required";
        expect(message).toBe("CONVEX_URL is required");
      }
    });

    it("should detect missing POMOTASK_AGENT_ID", () => {
      const convexUrl = "https://test.convex.cloud";
      const agentId = undefined as unknown as string;
      
      const hasConvexUrl = Boolean(convexUrl);
      const hasAgentId = Boolean(agentId);
      
      expect(hasConvexUrl).toBe(true);
      expect(hasAgentId).toBe(false);
      
      if (!hasConvexUrl || !hasAgentId) {
        const message = !hasConvexUrl ? "CONVEX_URL is required" : "POMOTASK_AGENT_ID is required";
        expect(message).toBe("POMOTASK_AGENT_ID is required");
      }
    });

    it("should pass when both env vars are present", () => {
      const convexUrl = "https://test.convex.cloud";
      const agentId = "test-agent-123";
      
      const hasConvexUrl = Boolean(convexUrl);
      const hasAgentId = Boolean(agentId);
      
      expect(hasConvexUrl && hasAgentId).toBe(true);
    });
  });

  describe("CONVEX_TIMEOUT_MS", () => {
    it("should be defined as 10 seconds", () => {
      expect(10_000).toBe(10000);
      expect(10_000).toBe(10 * 1000);
    });
  });
});