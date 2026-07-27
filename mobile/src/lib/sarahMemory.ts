import AsyncStorage from '@react-native-async-storage/async-storage';
import { sarahMemoryApi } from '@/api';
import { isApiConfigured } from '@/config/env';
import { getHistoryKey } from '@/context/storage';

/**
 * Sarah's memory of the person she talks to.
 *
 * The ElevenLabs agent is stateless between calls, so continuity has to come
 * from us: we keep a short, human-readable set of notes on this device and
 * send them as the `memory` dynamic variable when a call starts. Sarah's
 * prompt then treats them the way a friend would ("How did that appointment
 * go?") rather than reciting them.
 *
 * Storage is local-first with a per-person copy on the backend:
 *  - AsyncStorage answers instantly and works offline, so a call never waits
 *    on the network to know who it is talking to
 *  - the backend copy is keyed the same way chat history is (account when
 *    signed in, device otherwise), so Sarah follows a signed-in user to a new
 *    phone instead of forgetting them
 *  - a hard cap keeps the prompt cheap and stops it drifting into a wall of
 *    text the model starts ignoring
 */

const KEY = 'boomer.sarah.memory.v1';

/** Most recent conversations we keep notes for. */
const MAX_NOTES = 8;
/** Characters of memory we are willing to put in the prompt. */
const MAX_MEMORY_CHARS = 1200;

export type ConversationNote = {
  /** ISO timestamp of when the conversation happened. */
  at: string;
  /** One or two sentences about what was discussed. */
  summary: string;
};

export type SarahMemory = {
  notes: ConversationNote[];
  /** Total completed voice conversations, including ones aged out of `notes`. */
  totalConversations: number;
};

const EMPTY: SarahMemory = { notes: [], totalConversations: 0 };

export async function loadMemory(): Promise<SarahMemory> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<SarahMemory>;
    return {
      notes: Array.isArray(parsed.notes) ? parsed.notes.slice(-MAX_NOTES) : [],
      totalConversations: Number(parsed.totalConversations) || 0,
    };
  } catch {
    return EMPTY;
  }
}

async function save(memory: SarahMemory): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(memory));
  } catch {
    /* memory is a nicety — never break a call over it */
  }
}

/**
 * Pull this person's memory from the backend and adopt it if it is richer
 * than what this device has — the case that matters is a new phone, where
 * local is empty and the account already knows them.
 *
 * Best-effort: any failure just leaves the local copy in place.
 */
export async function syncMemoryFromServer(): Promise<SarahMemory> {
  const local = await loadMemory();
  if (!isApiConfigured) return local;
  try {
    const ownerKey = await getHistoryKey();
    const remote = await sarahMemoryApi.getMemory(ownerKey);
    const remoteNotes = Array.isArray(remote.notes) ? remote.notes : [];
    if (remoteNotes.length > local.notes.length ||
        (remote.totalConversations || 0) > local.totalConversations) {
      const merged: SarahMemory = {
        notes: remoteNotes.slice(-MAX_NOTES),
        totalConversations: Math.max(remote.totalConversations || 0, local.totalConversations),
      };
      await save(merged);
      return merged;
    }
    // Local is ahead (e.g. saved while offline) — push it up.
    void pushMemory(local);
    return local;
  } catch {
    return local;
  }
}

/** Best-effort upload so other devices on this account see the same Sarah. */
async function pushMemory(memory: SarahMemory): Promise<void> {
  if (!isApiConfigured) return;
  try {
    const ownerKey = await getHistoryKey();
    await sarahMemoryApi.putMemory({
      ownerKey,
      notes: memory.notes,
      totalConversations: memory.totalConversations,
    });
  } catch {
    /* the device copy is still correct — try again after the next call */
  }
}

/** Record what this conversation was about. */
export async function addNote(summary: string): Promise<void> {
  const clean = summary.trim();
  if (clean.length < 3) return;
  const memory = await loadMemory();
  memory.notes = [...memory.notes, { at: new Date().toISOString(), summary: clean }].slice(
    -MAX_NOTES,
  );
  memory.totalConversations += 1;
  await save(memory);
  void pushMemory(memory);
}

export async function clearMemory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** "3 days ago" / "yesterday" — how a person would say it, not a timestamp. */
function whenLabel(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 'recently';
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return 'earlier today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return 'last week';
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  return 'a while back';
}

/**
 * Build the `memory` dynamic variable sent to the agent. Newest notes go last
 * so the most recent context sits closest to the model's attention.
 */
export function buildMemoryPrompt(memory: SarahMemory): string {
  if (memory.notes.length === 0) {
    return "This is your first conversation with them — you don't know anything about them yet. Don't pretend otherwise.";
  }
  const lines = memory.notes.map((n) => `- ${whenLabel(n.at)}: ${n.summary}`);
  let text = lines.join('\n');
  // Trim oldest-first if we are over budget.
  while (text.length > MAX_MEMORY_CHARS && lines.length > 1) {
    lines.shift();
    text = lines.join('\n');
  }
  const count =
    memory.totalConversations > 1
      ? `You have spoken with them ${memory.totalConversations} times before.`
      : 'You have spoken with them once before.';
  return `${count} Here is what you remember:\n${text}`;
}

/** What the idle screen shows so the user can see Sarah remembers them. */
export function lastTopic(memory: SarahMemory): string | null {
  const last = memory.notes[memory.notes.length - 1];
  if (!last) return null;
  return `${whenLabel(last.at)}: ${last.summary}`;
}

/**
 * Turn a finished transcript into one or two sentences worth remembering.
 *
 * Falls back to the person's own words when the summariser is unreachable —
 * a rough note is far better than forgetting the conversation happened.
 */
export function fallbackSummary(userTurns: string[]): string {
  const joined = userTurns.join(' ').replace(/\s+/g, ' ').trim();
  if (!joined) return '';
  return joined.length > 220 ? `${joined.slice(0, 217)}…` : joined;
}
