import { apiPost } from './client';
import type { GenerateImageResult } from '@/types';

/**
 * Image generation + prompt improvement APIs.
 * Matches app/api/generate-image/route.ts and app/api/improve-prompt/route.ts.
 *
 * generate-image: POST { prompt } -> { imageUrl } | { error, errorType }
 * improve-prompt: POST { prompt } -> { improvedPrompt } | { error }
 */

export function generateImage(prompt: string): Promise<GenerateImageResult> {
  // Image generation can legitimately take a while on cold starts — give it
  // a longer leash than the default 30s before declaring a timeout.
  return apiPost<GenerateImageResult>('/api/generate-image', { prompt }, 75_000);
}

export function improvePrompt(
  prompt: string,
): Promise<{ improvedPrompt?: string; error?: string }> {
  return apiPost('/api/improve-prompt', { prompt });
}
