/**
 * task/list.ts — List available tasks
 * 
 * Lists tasks filtered by status and/or type.
 */

import { writeJson } from "../../lib/output.js";
import { NetworkError } from "../../lib/errors.js";
import { OutputFormat } from "../../lib/output.js";

export interface ListTaskOptions {
  status?: string;
  type?: string;
  format?: OutputFormat;
}

/**
 * Sanitize filter value - escape special characters for Convex query safety
 */
function sanitizeFilter(value: string): string {
  // Basic sanitization: remove potentially dangerous characters
  // that could affect Convex queries
  return value.replace(/[&|!(){}[\]^"~*?:\\/]/g, "");
}

export async function listTasks(options: ListTaskOptions): Promise<void> {
  try {
    // Sanitize filters if provided
    const sanitizedFilters = {
      status: options.status ? sanitizeFilter(options.status) : undefined,
      type: options.type ? sanitizeFilter(options.type) : undefined,
    };
    
    // TODO: Call actual Convex query when types are synced
    // const convex = getConvexClient();
    // const tasks = await convex.query("api:tasks.listTasks", { ...sanitizedFilters });
    
    // Placeholder response for now - will work with synced types
    // Note: In human format, we might want to use formatHuman but for now
    // we focus on the JSON contract.
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
