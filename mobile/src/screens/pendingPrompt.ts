/**
 * Tiny cross-screen channel for "send this prompt in Chat".
 *
 * Several screens (Lessons, Tips, Quick Questions) let the user jump into the
 * Chat tab with a pre-filled question. The Chat tab owns its own
 * `useChatSession` state, so rather than lifting that state up (which would
 * risk breaking the working chat screen) we stash the prompt here and let the
 * Chat screen pick it up when it gains focus.
 *
 * This is intentionally minimal — a single pending value plus subscribers.
 */

let pending: string | null = null;
const listeners = new Set<(prompt: string) => void>();

/** Queue a prompt to be sent the next time the Chat screen is focused. */
export function setPendingPrompt(prompt: string): void {
  pending = prompt;
  // Notify any already-mounted listener immediately.
  listeners.forEach((fn) => fn(prompt));
}

/** Read and clear the pending prompt (returns null if none). */
export function consumePendingPrompt(): string | null {
  const value = pending;
  pending = null;
  return value;
}

/** Subscribe to prompts pushed while the Chat screen is mounted. */
export function subscribePendingPrompt(fn: (prompt: string) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

// ---- "open Chat and start listening" (GlobalChatBar mic) ----

let pendingMic = false;

/** Ask the Chat screen to start voice recording the next time it gains focus. */
export function setPendingMic(): void {
  pendingMic = true;
}

/** Read and clear the pending-mic request. */
export function consumePendingMic(): boolean {
  const value = pendingMic;
  pendingMic = false;
  return value;
}
