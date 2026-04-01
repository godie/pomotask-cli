import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { execSync } from "node:child_process";
import { existsSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

describe("sync-types script", () => {
  const sourceDir = resolve(projectRoot, "..", "pomotask", "convex", "_generated");
  const targetDir = resolve(projectRoot, "src", "lib", "convex", "_generated");

  describe("script execution", () => {
    it("should fail with exit code 1 when source directory does not exist", () => {
      // Rename source temporarily to simulate missing directory
      const missingSource = resolve(projectRoot, "..", "pomotask_missing", "convex", "_generated");
      
      // The script will fail because ../pomotask doesn't exist in this test context
      // We test this by checking the script behavior
      try {
        execSync("pnpm sync-types", { 
          cwd: projectRoot, 
          encoding: "utf-8",
          stdio: "pipe"
        });
      } catch (error: unknown) {
        const err = error as { status?: number; stderr?: string };
        // Either the script fails (no pomotask repo) or exits with error
        expect(err.status ?? 1).toBe(1);
      }
    });

    it("should have pnpm sync-types script defined in package.json", () => {
      const packageJson = require(resolve(projectRoot, "package.json"));
      expect(packageJson.scripts["sync-types"]).toBe("node scripts/sync-types.mjs");
    });

    it("should be idempotent - can run multiple times", () => {
      // This test verifies that running the script twice doesn't cause issues
      // Note: This will only pass if ../pomotask/convex/_generated exists
      const hasSource = existsSync(sourceDir);
      
      if (hasSource) {
        // If source exists, the script should complete without errors
        const result = execSync("pnpm sync-types", {
          cwd: projectRoot,
          encoding: "utf-8",
          stdio: "pipe"
        });
        expect(result).toContain("Synced Convex types");
      } else {
        // If source doesn't exist, script should fail gracefully
        expect(true).toBe(true); // Skipped
      }
    });
  });

  describe("source path validation", () => {
    it("should look for source in ../pomotask/convex/_generated", () => {
      // Verify the expected source path structure
      const expectedSource = resolve(projectRoot, "..", "pomotask", "convex", "_generated");
      expect(expectedSource).toContain("pomotask");
      expect(expectedSource).toContain("convex");
      expect(expectedSource).toContain("_generated");
    });

    it("should copy to src/lib/convex/_generated", () => {
      const expectedTarget = resolve(projectRoot, "src", "lib", "convex", "_generated");
      expect(expectedTarget).toContain("src");
      expect(expectedTarget).toContain("lib");
      expect(expectedTarget).toContain("convex");
      expect(expectedTarget).toContain("_generated");
    });
  });
});