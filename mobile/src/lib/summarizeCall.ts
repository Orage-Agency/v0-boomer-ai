import { chatApi } from '@/api';
import { isApiConfigured } from '@/config/env';
import { fallbackSummary } from '@/lib/sarahMemory';
import { makeMessageId } from '@/screens/useChat';
import type { ChatMessage } from '@/types';

/**
 * Condense a finished voice call into the one or two sentences Sarah should
 * carry into the next one.
 *
 * Runs after the call ends, so latency costs the user nothing. If the request
 * fails we keep the person's own words instead — forgetting the conversation
 * happened is the worse outcome.
 */

export type CallTurn = { role: 'user' | 'agent'; text: string };

/** Ignore hellos and goodbyes — a two-line call has nothing worth remembering. */
const MIN_USER_TURNS = 2;

export async function summarizeCall(turns: CallTurn[]): Promise<string> {
  const userTurns = turns.filter((t) => t.role === 'user').map((t) => t.text.trim()).filter(Boolean);
  if (userTurns.length < MIN_USER_TURNS) return '';

  const transcript = turns
    .map((t) => `${t.role === 'user' ? 'Person' : 'Sarah'}: ${t.text}`)
    .join('\n')
    .slice(0, 4000);

  if (!isApiConfigured) return fallbackSummary(userTurns);

  const prompt = `Below is a transcript of a voice conversation between an older adult and Sarah, their AI companion.

Write ONE or TWO short sentences capturing only what is worth remembering next time: what they talked about, anything personal they shared (names, family, health, hobbies, plans), and anything they said they would do.

Write it as notes about the person, in third person, starting with "They". Do not mention Sarah. Do not add commentary. If nothing is worth remembering, reply with exactly: NOTHING

Transcript:
${transcript}`;

  try {
    const messages: ChatMessage[] = [
      { id: makeMessageId('sum'), role: 'user', parts: [{ type: 'text', text: prompt }] },
    ];
    const reply = await chatApi.sendChat({ messages });
    const clean = reply.trim();
    if (!clean || /^nothing\b/i.test(clean)) return '';
    return clean.length > 300 ? `${clean.slice(0, 297)}…` : clean;
  } catch {
    return fallbackSummary(userTurns);
  }
}
