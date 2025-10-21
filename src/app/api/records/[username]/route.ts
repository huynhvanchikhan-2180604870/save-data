import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token)
      return NextResponse.json({ error: "No token" }, { status: 401 });

    const decoded = verifySession(token);
    if (!decoded)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { username } = params;
    if (decoded.username !== username)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const client = await clientPromise;
    const db = client.db("user_data");
    const collection = db.collection("records");

    const records = await collection
      .find({ username })
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json(
      { success: true, count: records.length, data: records },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch records error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
