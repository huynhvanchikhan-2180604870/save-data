import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const SECRET = process.env.AUTH_SECRET!;

export function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const path = url.pathname;

  // Chỉ bảo vệ đường dẫn /api/records/<teamName>
  const match = path.match(/^\/api\/records\/([^\/]+)\/?$/);
  if (!match) return NextResponse.next();

  const teamParam = decodeURIComponent(match[1]);
  const token = req.cookies.get("session")?.value;

  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const payload = jwt.verify(token, SECRET) as { teamName: string };
    if (payload.teamName !== teamParam) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/records/:path*"],
};
