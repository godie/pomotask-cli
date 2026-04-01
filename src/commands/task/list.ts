/**
 * task/list.ts — List available tasks
 * 
 * Lists tasks filtered by status and/or type.
 */

import { writeJson } from "../../lib/output.js";
import { NetworkError } from "../../lib/errors.js";

export interface ListTaskOptions {
  status?: string;
  type?: string;
}

export async function listTasks(_options: ListTaskOptions): Promise<void> {
  try {
    // TODO: Call actual Convex query when types are synced
    // const convex = getConvexClient();
    // const tasks = await convex.query("api:tasks.list", { ...options });
    
    // Placeholder response for now - will work with synced types
    writeJson({
      ok: true,
      command: "task list",
      data: [],
      filters: _options,
    });
  } catch (err) {
    throw new NetworkError(err instanceof Error ? err.message : "Failed to list tasks");
  }
}
