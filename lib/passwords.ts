import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const HASH_BYTES = 64;
const SCRYPT_OPTIONS = { N: 32_768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

function derive(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, HASH_BYTES, SCRYPT_OPTIONS, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derived = await derive(password, salt);
  return `scrypt$${salt}$${derived.toString('hex')}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<{ valid: boolean; needsRehash: boolean }> {
  const [scheme, salt, digest] = stored.split('$');
  if (scheme === 'scrypt' && salt && digest) {
    try {
      const expected = Buffer.from(digest, 'hex');
      if (expected.length !== HASH_BYTES) return { valid: false, needsRehash: false };
      const actual = await derive(password, salt);
      return { valid: timingSafeEqual(actual, expected), needsRehash: false };
    } catch {
      return { valid: false, needsRehash: false };
    }
  }

  // Existing accounts stored the password directly. Upgrade the hash only
  // after a successful login so users keep access without retaining plaintext.
  const provided = Buffer.from(password);
  const legacy = Buffer.from(stored);
  const same = provided.length === legacy.length && timingSafeEqual(provided, legacy);
  return { valid: same, needsRehash: same };
}
