import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token)
      return NextResponse.json({ error: "No token" }, { status: 401 });

    const decoded = verifySession(token);
    if (!decoded)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    return NextResponse.json({ ok: true, username: decoded.username });
  } catch {
    return NextResponse.json(
      { error: "Profile fetch failed" },
      { status: 500 }
    );
  }
}
