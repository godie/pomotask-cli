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

const VALID_COMMENT_TYPES = ["clarification", "response", "context", "progress"];

/**
 * Validate comment type - must be one of the allowed types
 */
function isValidCommentType(type: string): boolean {
  return VALID_COMMENT_TYPES.includes(type.toLowerCase());
}

/**
 * Validate comment message - must be non-empty after trimming
 */
function isValidMessage(message: string): boolean {
  return message.trim().length > 0;
}

export async function commentTask(options: CommentTaskOptions): Promise<void> {
  try {
    // Validate inputs
    if (!options.type || !options.message) {
      throw new ValidationError("--type and --message are required");
    }
    
    // Validate comment type is one of the allowed types
    if (!isValidCommentType(options.type)) {
      throw new ValidationError(`Invalid comment type. Must be one of: ${VALID_COMMENT_TYPES.join(", ")}`);
    }
    
    // Validate message is not empty after trimming
    if (!isValidMessage(options.message)) {
      throw new ValidationError("Comment message cannot be empty.");
    }
    
    // TODO: Call actual Convex mutation when types are synced
    // const convex = getConvexClient();
    // await convex.mutation("api:tasks.commentTask", {
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
