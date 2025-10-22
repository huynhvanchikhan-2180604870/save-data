import { verifySession } from "@/lib/auth"; // hàm verify Bearer token của bạn
import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) return NextResponse.json({ ok: false }, { status: 401 });

    const payload = verifySession(token); // { username }
    if (!payload?.username)
      return NextResponse.json({ ok: false }, { status: 401 });

    const client = await clientPromise;
    const db = client.db("user_data");
    const users = db.collection("users");
    const user = await users.findOne(
      { username: payload.username },
      { projection: { username: 1, blocked: 1 } }
    );
    if (!user) return NextResponse.json({ ok: false }, { status: 404 });

    return NextResponse.json({
      ok: true,
      username: user.username,
      blocked: Boolean(user.blocked),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
