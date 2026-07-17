import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE_NAME = "qminh_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set");
  }
  return secret;
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

/** Constant-time string comparison to avoid timing side-channels. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Still run a comparison of equal-length buffers so the early return
    // above doesn't become its own (much coarser-grained) timing signal.
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

export function createSessionToken(): string {
  const payload = JSON.stringify({ exp: Date.now() + SESSION_TTL_MS });
  const payloadB64 = base64UrlEncode(payload);
  const signature = sign(payloadB64);
  return `${payloadB64}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return false;

  const expectedSignature = sign(payloadB64);
  if (!safeEqual(signature, expectedSignature)) return false;

  try {
    const payload = JSON.parse(base64UrlDecode(payloadB64)) as { exp: number };
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function verifyAdminKey(provided: string | undefined | null): boolean {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected || !provided) return false;
  return safeEqual(provided, expected);
}

export function isOriginAllowed(origin: string | null): boolean {
  const allowed = process.env.ADMIN_ALLOWED_ORIGINS;
  if (!allowed) return true; // no allowlist configured, skip the check
  if (!origin) return false;
  return allowed.split(",").map((o) => o.trim()).includes(origin);
}

/**
 * Route Handler auth guard: accepts either the browser session cookie
 * (set by loginAction) or a direct ADMIN_API_KEY (Bearer or x-admin-key
 * header), for programmatic/API-style access.
 */
export function isAuthorizedRequest(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (origin && !isOriginAllowed(origin)) return false;

  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (verifySessionToken(sessionToken)) return true;

  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  const headerKey = bearer ?? request.headers.get("x-admin-key");
  return verifyAdminKey(headerKey);
}
