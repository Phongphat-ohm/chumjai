import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { UserRole } from "@prisma/client";

const COOKIE_NAME = "chunjai_session";
const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "default-chunjai-dev-secret-key-999"
);

export interface UserSessionPayload {
  userId: string;
  username: string;
  fullName: string;
  role: UserRole;
  expiresAt: string;
}

// ----------------------------------------------------
// Password Security
// ----------------------------------------------------

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(
  plainText: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(plainText, hashed);
}

// ----------------------------------------------------
// JWT Session Encryption & Decryption
// ----------------------------------------------------

export async function encryptSession(payload: UserSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function decryptSession(
  token: string
): Promise<UserSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });
    return payload as unknown as UserSessionPayload;
  } catch (error) {
    return null;
  }
}

// ----------------------------------------------------
// Cookie Management (Server Components & Server Actions)
// ----------------------------------------------------

export async function setSessionCookie(payload: UserSessionPayload) {
  const token = await encryptSession(payload);
  const cookieStore = cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

export async function getSession(): Promise<UserSessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  return decryptSession(token);
}

export async function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

export { COOKIE_NAME };
