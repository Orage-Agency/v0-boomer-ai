/**
 * Read-only App Store Connect check: what builds exist and are they in the
 * TestFlight group? No writes, no submissions.
 *
 * Run: node elevenlabs-agent/asc-check.mjs
 */
import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';

const KEY_ID = '95ZNZYMM7U';
const ISSUER = '95620806-51c7-483f-8768-cfc04b921850';
const KEY_PATH =
  'C:/Users/georg/boomer-handoff-2026-07-10/credentials/asc/AuthKey_95ZNZYMM7U.p8';
const APP_ID = '6755741429';
const GROUP_ID = '6162d862-da50-4650-b96d-8f55ea851ef5';

const b64u = (buf) =>
  Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/** DER (ASN.1) ECDSA signature -> raw r||s that JOSE ES256 expects. */
function derToJose(der) {
  let off = 2;
  if (der[1] & 0x80) off = 2 + (der[1] & 0x7f);
  const readInt = () => {
    const len = der[off + 1];
    let start = off + 2;
    let end = start + len;
    while (der[start] === 0x00 && end - start > 32) start += 1;
    const out = Buffer.alloc(32);
    der.subarray(start, end).copy(out, 32 - (end - start));
    off = end;
    return out;
  };
  const r = readInt();
  const s = readInt();
  return Buffer.concat([r, s]);
}

function token() {
  const header = { alg: 'ES256', kid: KEY_ID, typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = { iss: ISSUER, iat: now, exp: now + 600, aud: 'appstoreconnect-v1' };
  const signingInput = `${b64u(JSON.stringify(header))}.${b64u(JSON.stringify(payload))}`;
  const signer = createSign('SHA256');
  signer.update(signingInput);
  signer.end();
  const der = signer.sign(readFileSync(KEY_PATH, 'utf8'));
  return `${signingInput}.${b64u(derToJose(der))}`;
}

async function api(path) {
  const res = await fetch(`https://api.appstoreconnect.apple.com${path}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

const builds = await api(
  `/v1/builds?filter[app]=${APP_ID}&sort=-uploadedDate&limit=5&fields[builds]=version,processingState,uploadedDate,expired`,
);
console.log('--- Recent builds (newest first) ---');
if (builds.status !== 200) {
  console.log('HTTP', builds.status, JSON.stringify(builds.body).slice(0, 300));
} else {
  for (const b of builds.body.data || []) {
    const a = b.attributes;
    console.log(
      `  build ${String(a.version).padEnd(4)} | ${String(a.processingState).padEnd(10)} | uploaded ${a.uploadedDate} | expired=${a.expired}`,
    );
  }
}

const group = await api(`/v1/betaGroups/${GROUP_ID}/builds?limit=200&fields[builds]=version`);
const inGroup = (group.body.data || []).map((b) => b.attributes?.version).sort((a, b) => b - a);
console.log('--- Builds in TestFlight group "BOOMER AI V1" ---');
console.log('  ', inGroup.length ? inGroup.slice(0, 8).join(', ') : '(none / ' + group.status + ')');

// ---- TestFlight crash feedback (if any tester submitted one) ----
const crashes = await api(
  `/v1/betaFeedbackCrashSubmissions?filter[build]=818f2146-e621-453c-9370-359fcd710560&limit=10`,
);
console.log('--- TestFlight crash submissions (build 39) ---');
console.log('  HTTP', crashes.status, JSON.stringify(crashes.body).slice(0, 500));
