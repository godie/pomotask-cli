/**
 * task/comment.ts — Add a comment to a task
 * 
 * Adds a comment to a task with type and message.
 */

import { writeJson } from "../../lib/output.js";
import { NetworkError, ValidationError } from "../../lib/errors.js";

export interface CommentTaskOptions {
  taskId: string;
  type: string;
  message: string;
}

export async function commentTask(options: CommentTaskOptions): Promise<void> {
  try {
    // Validate inputs
    if (!options.type || !options.message) {
      throw new ValidationError("--type and --message are required");
    }
    
    // TODO: Call actual Convex mutation when types are synced
    // const convex = getConvexClient();
    // await convex.mutation("api:tasks.comment", {
    //   taskId: options.taskId,
    //   agentId: AGENT_ID,
    //   type: options.type,
    //   message: options.message,
    // });
    
    writeJson({
      ok: true,
      command: "task comment",
      taskId: options.taskId,
      type: options.type,
      message: options.message,
    });
  } catch (err) {
    if (err instanceof ValidationError || err instanceof NetworkError) {
      throw err;
    }
    throw new NetworkError(err instanceof Error ? err.message : "Failed to add comment");
  }
}
