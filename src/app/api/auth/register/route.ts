import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password)
      return NextResponse.json(
        { ok: false, error: "Missing fields" },
        { status: 400 }
      );

    const client = await clientPromise;
    const db = client.db("user_data");
    const users = db.collection("users");

    const existed = await users.findOne({ username });
    if (existed)
      return NextResponse.json(
        { ok: false, error: "User already exists" },
        { status: 409 }
      );

    const passwordHash = await bcrypt.hash(password, 10);
    await users.insertOne({ username, passwordHash, createdAt: new Date() });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: "Register failed" },
      { status: 500 }
    );
  }
}
