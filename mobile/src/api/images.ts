import { apiGet, apiPost } from './client';
import { API_PATHS } from '@boomer-ai/shared';
import type { GenerateImageResult, ImageProviderAvailability } from '@/types';

export type ImageProvider = 'fal' | 'openai-codex';

/**
 * Image generation + prompt improvement APIs.
 * Matches app/api/generate-image/route.ts and app/api/improve-prompt/route.ts.
 *
 * generate-image: POST { prompt } -> { imageUrl } | { error, errorType }
 * improve-prompt: POST { prompt } -> { improvedPrompt } | { error }
 */

export function getImageProviders(): Promise<ImageProviderAvailability> {
  return apiGet<ImageProviderAvailability>(API_PATHS.generateImage);
}

export function generateImage(prompt: string, provider: ImageProvider): Promise<GenerateImageResult> {
  return apiPost<GenerateImageResult>(API_PATHS.generateImage, { prompt, provider });
}

export function improvePrompt(
  prompt: string,
): Promise<{ improvedPrompt?: string; error?: string }> {
  return apiPost(API_PATHS.improvePrompt, { prompt });
}
