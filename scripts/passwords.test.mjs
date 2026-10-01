import assert from 'node:assert/strict';
import test from 'node:test';
import { hashPassword, verifyPassword } from '../lib/passwords.ts';

test('scrypt hash accepts the right password and rejects another one', async () => {
  const hash = await hashPassword('a-test-password-123');
  assert.match(hash, /^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/);
  assert.deepEqual(await verifyPassword('a-test-password-123', hash), {
    valid: true,
    needsRehash: false,
  });
  assert.deepEqual(await verifyPassword('different-password', hash), {
    valid: false,
    needsRehash: false,
  });
});

test('legacy passwords are accepted only for a one-time hash upgrade', async () => {
  assert.deepEqual(await verifyPassword('legacy-password', 'legacy-password'), {
    valid: true,
    needsRehash: true,
  });
  assert.deepEqual(await verifyPassword('wrong-password', 'legacy-password'), {
    valid: false,
    needsRehash: false,
  });
});
