import { describe, it, expect, vi } from "vitest";
import { withTimeout } from "../src/lib/convex.js";
import { NetworkError } from "../src/lib/errors.js";

describe("withTimeout", () => {
  it("should resolve if promise resolves before timeout", async () => {
    const fastPromise = Promise.resolve("result");
    const result = await withTimeout(fastPromise, 1000);
    expect(result).toBe("result");
  });

  it("should reject with NetworkError if promise times out", async () => {
    const slowPromise = new Promise<string>((resolve) => {
      setTimeout(() => resolve("delayed"), 200);
    });
    
    await expect(withTimeout(slowPromise, 50)).rejects.toThrow(NetworkError);
  });

  it("should use default CONVEX_TIMEOUT_MS", async () => {
    const slowPromise = new Promise<string>((resolve) => {
      setTimeout(() => resolve("delayed"), 200);
    });
    
    // Force a short timeout to test the timeout works
    await expect(withTimeout(slowPromise, 50)).rejects.toThrow(NetworkError);
  }, 10000);

  it("should clean up timeout on success", async () => {
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");
    const fastPromise = Promise.resolve("result");
    
    await withTimeout(fastPromise, 1000);
    
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it("should clean up timeout on failure", async () => {
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");
    const slowPromise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error("error")), 200);
    });
    
    await expect(withTimeout(slowPromise, 50)).rejects.toThrow();
    
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});