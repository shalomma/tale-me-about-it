/**
 * Minimal single-password admin session for v1 (no user accounts yet).
 *
 * The cookie holds `<expiry>.<signature>`, signed with HMAC-SHA256. The key
 * mixes ADMIN_SESSION_SECRET with ADMIN_PASSWORD, so changing the password
 * signs everyone out. Uses Web Crypto so it runs in the proxy and on the server.
 */
export const SESSION_COOKIE = "tmai_admin";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const encoder = new TextEncoder();

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD) && (process.env.ADMIN_SESSION_SECRET ?? "").length >= 32;
}

function toBase64Url(bytes: ArrayBuffer): string {
  let s = "";
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(`${process.env.ADMIN_SESSION_SECRET}:${process.env.ADMIN_PASSWORD}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toBase64Url(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
}

/** Constant-time string comparison (compares SHA-256 digests of both values). */
export async function safeEqual(a: string, b: string): Promise<boolean> {
  const [da, db] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(a)),
    crypto.subtle.digest("SHA-256", encoder.encode(b)),
  ]);
  const x = new Uint8Array(da);
  const y = new Uint8Array(db);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

export async function createSessionValue(): Promise<string> {
  const expires = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  return `${expires}.${await sign(String(expires))}`;
}

export async function verifySessionValue(value: string | undefined): Promise<boolean> {
  if (!value || !adminConfigured()) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || !/^\d+$/.test(expires)) return false;
  if (Number(expires) < Date.now() / 1000) return false;
  return safeEqual(signature, await sign(expires));
}

export async function checkPassword(candidate: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !adminConfigured()) return false;
  return safeEqual(candidate, expected);
}
