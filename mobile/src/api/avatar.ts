import { env } from '@/config/env';

/**
 * Upload a user avatar image to the Boomer AI backend.
 * POST multipart/form-data with file + deviceId
 * Returns the public CDN URL of the uploaded avatar.
 */
export async function uploadAvatar(
  localUri: string,
  deviceId: string,
): Promise<string> {
  const base = env.apiBaseUrl.replace(/\/$/, '');
  const filename = localUri.split('/').pop() ?? 'avatar.jpg';
  const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
  const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

  const formData = new FormData();
  // React Native FormData accepts { uri, name, type } for files
  formData.append('file', { uri: localUri, name: filename, type: mimeType } as unknown as Blob);
  formData.append('deviceId', deviceId);

  const res = await fetch(`${base}/api/upload-avatar`, {
    method: 'POST',
    body: formData,
    // Don't set Content-Type: let fetch set multipart/form-data + boundary
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Avatar upload failed (${res.status}): ${text}`);
  }

  const data = await res.json() as { url?: string; error?: string };
  if (!data.url) throw new Error(data.error ?? 'No URL returned from upload');
  return data.url;
}
