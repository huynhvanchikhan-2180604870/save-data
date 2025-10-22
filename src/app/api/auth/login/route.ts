import { signSession } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json(
        { ok: false, error: "Missing credentials" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("user_data");
    const users = db.collection("users");

    const user = await users.findOne({ username });
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    const ok = await bcrypt.compare(password, (user as any).passwordHash);
    if (!ok) {
      return NextResponse.json(
        { ok: false, error: "Invalid password" },
        { status: 401 }
      );
    }

    const token = signSession({ username });
    const blocked = Boolean((user as any).blocked);

    // ⬅️ trả kèm trạng thái
    return NextResponse.json(
      { ok: true, username, blocked, token },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: "Login failed" },
      { status: 500 }
    );
  }
}
