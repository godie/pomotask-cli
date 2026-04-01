/**
 * task/list.ts — List available tasks
 * 
 * Lists tasks filtered by status and/or type.
 */

import { getConvexClient } from "../../lib/convex.js";
import { writeJson } from "../../lib/output.js";
import { NetworkError } from "../../lib/errors.js";

export interface ListTaskOptions {
  status?: string;
  type?: string;
}

/**
 * Sanitize filter value - escape special characters for Convex query safety
 */
function sanitizeFilter(value: string): string {
  // Basic sanitization: remove potentially dangerous characters
  // that could affect Convex queries
  return value.replace(/[&|!(){}[\]^"~*?:\\/]/g, "");
}

export async function listTasks(_options: ListTaskOptions): Promise<void> {
  try {
    // Sanitize filters if provided
    const sanitizedFilters = {
      status: _options.status ? sanitizeFilter(_options.status) : undefined,
      type: _options.type ? sanitizeFilter(_options.type) : undefined,
    };
    
    // TODO: Call actual Convex query when types are synced
    // const convex = getConvexClient();
    // const tasks = await convex.query("api:tasks.list", { ...sanitizedFilters });
    
    // Placeholder response for now - will work with synced types
    writeJson({
      ok: true,
      command: "task list",
      data: [],
      filters: sanitizedFilters,
    });
  } catch (err) {
    throw new NetworkError(err instanceof Error ? err.message : "Failed to list tasks");
  }
}
