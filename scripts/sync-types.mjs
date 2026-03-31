/**
 * sync-types.mjs — Copies Convex generated types from the main Pomotask repo.
 *
 * Source: ../Pomotask/convex/_generated
 * Target: src/lib/convex/_generated
 *
 * Usage: pnpm sync-types
 */

import { cpSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const source = resolve(projectRoot, "..", "Pomotask", "convex", "_generated");
const target = resolve(projectRoot, "src", "lib", "convex", "_generated");

if (!existsSync(source)) {
  console.error(
    `ERROR: Convex generated types not found at: ${source}\n` +
      `Make sure the Pomotask repo exists at ../Pomotask and has been built.`,
  );
  process.exit(1);
}

cpSync(source, target, { recursive: true, force: true });
console.log(`✓ Synced Convex types from ${source} → ${target}`);
