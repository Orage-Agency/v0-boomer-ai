import { env } from '@/config/env';

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * Dependency-free base64 of an ArrayBuffer. React Native has no global
 * `Buffer`, so the previous `Buffer.from(...)` threw and TTS silently fell
 * back to the robot device voice — this is why the nice voice never played.
 */
function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let out = '';
  let i = 0;
  for (; i + 2 < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    out += B64[(n >> 18) & 63] + B64[(n >> 12) & 63] + B64[(n >> 6) & 63] + B64[n & 63];
  }
  const rem = bytes.length - i;
  if (rem === 1) {
    const n = bytes[i] << 16;
    out += B64[(n >> 18) & 63] + B64[(n >> 12) & 63] + '==';
  } else if (rem === 2) {
    const n = (bytes[i] << 16) | (bytes[i + 1] << 8);
    out += B64[(n >> 18) & 63] + B64[(n >> 12) & 63] + B64[(n >> 6) & 63] + '=';
  }
  return out;
}

/**
 * Text-to-Speech via the Boomer AI backend proxy (/api/tts).
 * Returns a base64 data URI that expo-av can play directly.
 *
 * Default voice "nova" is warm and clear (better for older listeners than the
 * flat "alloy"); `speed` slightly under 1 makes it easier to follow.
 */
export async function speakText(
  text: string,
  voice = 'nova',
  speed = 0.95,
): Promise<string> {
  const base = env.apiBaseUrl.replace(/\/$/, '');
  const res = await fetch(`${base}/api/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: text.slice(0, 4096), voice, speed }),
  });

  if (!res.ok) {
    throw new Error(`TTS request failed: ${res.status}`);
  }

  const buffer = await res.arrayBuffer();
  return `data:audio/mpeg;base64,${arrayBufferToBase64(buffer)}`;
}
