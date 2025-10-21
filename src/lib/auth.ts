import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const SECRET = process.env.AUTH_SECRET!;
if (!SECRET) throw new Error("Missing AUTH_SECRET in .env.local");

export type SessionPayload = {
  username: string;
};

export function signSession(
  payload: SessionPayload,
  maxAgeSec = 60 * 60 * 24 * 7
) {
  return jwt.sign(payload, SECRET, { expiresIn: maxAgeSec });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export function getSessionFromRequest(req: NextRequest): SessionPayload | null {
  const cookie = req.cookies.get("session")?.value;
  if (!cookie) return null;
  return verifySession(cookie);
}
