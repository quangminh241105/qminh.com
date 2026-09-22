import { cookies, headers } from "next/headers";

const encoder = new TextEncoder();
export const SESSION_COOKIE_NAME = "admin_session";

export function timingSafeEqual(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

function getSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || "default_local_dev_secret_replace_in_prod";
}

function getAdminApiKey(): string {
  return process.env.ADMIN_API_KEY || "Obsidian_Bruh2411";
}

export async function signSession(payload: Record<string, unknown>, secret = getSessionSecret()): Promise<string> {
  const dataString = JSON.stringify({
    ...payload,
    iat: Date.now(),
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  });

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const payloadBase64 = Buffer.from(dataString).toString("base64url");
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadBase64));
  const signatureBase64 = Buffer.from(signatureBuffer).toString("base64url");

  return `${payloadBase64}.${signatureBase64}`;
}

export async function verifySession(
  token: string | undefined | null,
  secret = getSessionSecret()
): Promise<Record<string, unknown> | null> {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payloadBase64, signatureBase64] = parts;

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureBuffer = Buffer.from(signatureBase64, "base64url");
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBuffer,
      encoder.encode(payloadBase64)
    );

    if (!isValid) return null;

    const decoded = JSON.parse(Buffer.from(payloadBase64, "base64url").toString("utf-8"));
    if (decoded.exp && Date.now() > decoded.exp) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

export async function isAuthenticatedAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (token) {
      const session = await verifySession(token);
      if (session && session.role === "admin") {
        return true;
      }
    }

    const headerList = await headers();
    const authHeader = headerList.get("authorization");
    const xAdminKey = headerList.get("x-admin-key");
    const expectedKey = getAdminApiKey();

    if (authHeader?.startsWith("Bearer ")) {
      const bearerToken = authHeader.slice(7).trim();
      if (timingSafeEqual(bearerToken, expectedKey)) {
        return true;
      }
    }

    if (xAdminKey && timingSafeEqual(xAdminKey.trim(), expectedKey)) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

export function verifyAdminPassword(password: string): boolean {
  const expectedKey = getAdminApiKey();
  return timingSafeEqual(password.trim(), expectedKey.trim());
}
