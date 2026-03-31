/**
 * Normalize a progress message for Convex.
 * - Collapses repeated whitespace
 * - Collapses newlines into spaces
 * - Truncates to 280 characters
 */
export function normalizeProgressMessage(raw: string): string {
  const collapsed = raw.replace(/\s+/g, " ").trim();
  return collapsed.slice(0, 280);
}
