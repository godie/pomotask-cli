/**
 * task/create.ts — Create a new task
 * 
 * Creates a new task with title, type, and project ID.
 */

import { writeJson } from "../../lib/output.js";
import { NetworkError, ValidationError } from "../../lib/errors.js";

export interface CreateTaskOptions {
  title: string;
  type: string;
  projectId: string;
}

export async function createTask(options: CreateTaskOptions): Promise<void> {
  try {
    // Validate inputs
    if (!options.title || !options.type || !options.projectId) {
      throw new ValidationError("--title, --type, and --project are required");
    }
    
    // TODO: Call actual Convex mutation when types are synced
    // const convex = getConvexClient();
    // const task = await convex.mutation("api:tasks.create", {
    //   title: options.title,
    //   type: options.type,
    //   projectId: options.projectId,
    // });
    
    writeJson({
      ok: true,
      command: "task create",
      data: {
        title: options.title,
        type: options.type,
        projectId: options.projectId,
      },
    });
  } catch (err) {
    if (err instanceof ValidationError || err instanceof NetworkError) {
      throw err;
    }
    throw new NetworkError(err instanceof Error ? err.message : "Failed to create task");
  }
}
