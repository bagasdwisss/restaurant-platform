import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { prisma } from "./prisma";

const AUTH_SECRET = process.env.JWT_SECRET || "restosync-secret-super-key-2026-secure";
const COOKIE_NAME = "restosync_session";

export interface UserSession {
  id: number;
  username: string;
  email: string;
  name: string;
  role: "admin" | "kasir" | "user";
  phone?: string | null;
}

/**
 * Hash password with sha256 + salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify password against stored hash or fallback to direct compare for seed
 */
export function verifyPassword(password: string, stored: string): boolean {
  if (password === stored) return true; // Direct compare for pre-seeded simple passwords
  if (!stored.includes(":")) return false;
  
  const [salt, originalHash] = stored.split(":");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === originalHash;
}

/**
 * Create signed HMAC session token
 */
export function createSessionToken(user: UserSession): string {
  const payload = Buffer.from(
    JSON.stringify({
      ...user,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    })
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

/**
 * Verify and decode session token
 */
export function verifySessionToken(token: string): UserSession | null {
  try {
    if (!token || !token.includes(".")) return null;
    const [payloadBase64, signature] = token.split(".");

    const expectedSignature = crypto
      .createHmac("sha256", AUTH_SECRET)
      .update(payloadBase64)
      .digest("base64url");

    if (signature !== expectedSignature) return null;

    const decoded = JSON.parse(Buffer.from(payloadBase64, "base64url").toString("utf8"));
    if (decoded.exp && Date.now() > decoded.exp) return null;

    return {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      phone: decoded.phone,
    };
  } catch {
    return null;
  }
}

/**
 * Get current session user from NextRequest or next/headers cookies
 */
export async function getCurrentUser(request?: NextRequest): Promise<UserSession | null> {
  try {
    let token: string | undefined;

    if (request) {
      token = request.cookies.get(COOKIE_NAME)?.value;
      if (!token) {
        const authHeader = request.headers.get("Authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
          token = authHeader.substring(7);
        }
      }
    } else {
      const cookieStore = await cookies();
      token = cookieStore.get(COOKIE_NAME)?.value;
    }

    if (!token) return null;
    const session = verifySessionToken(token);
    if (!session) return null;

    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, username: true, email: true, name: true, role: true, phone: true },
    });

    if (!user) return null;
    return user as UserSession;
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
