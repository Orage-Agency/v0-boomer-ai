import { env } from '@/config/env';

/**
 * Text-to-Speech via the Boomer AI backend proxy (/api/tts).
 * Returns a remote audio URL that expo-av can play.
 *
 * POST { text, voice? } -> audio/mpeg binary (returned as blob URL).
 */
export async function speakText(text: string, voice = 'alloy'): Promise<string> {
  const base = env.apiBaseUrl.replace(/\/$/, '');
  const res = await fetch(`${base}/api/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: text.slice(0, 4096), voice }),
  });

  if (!res.ok) {
    throw new Error(`TTS request failed: ${res.status}`);
  }

  const buffer = await res.arrayBuffer();
  const blob = new Blob([buffer], { type: 'audio/mpeg' });
  // React Native supports URL.createObjectURL via react-native-blob-util;
  // for expo-av, we write to a temp file instead — caller handles the buffer.
  // Return a data URI so expo-av can load it directly.
  const base64 = Buffer.from(buffer).toString('base64');
  return `data:audio/mpeg;base64,${base64}`;
}
