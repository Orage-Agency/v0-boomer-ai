import { env } from '@/config/env';

/**
 * Upload a recorded audio file (local file:// URI from expo-av) to the
 * Boomer AI backend Whisper proxy and return the transcribed text.
 */
export async function transcribeAudio(localUri: string): Promise<string> {
  const base = env.apiBaseUrl.replace(/\/$/, '');
  const form = new FormData();
  form.append('audio', {
    uri: localUri,
    name: 'recording.m4a',
    type: 'audio/m4a',
  } as unknown as Blob);

  const res = await fetch(`${base}/api/transcribe`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    throw new Error(`transcribe failed: ${res.status}`);
  }
  const data = (await res.json()) as { text?: string };
  return (data.text ?? '').trim();
}
