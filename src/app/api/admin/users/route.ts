import { isAllowedAdminIp } from "@/lib/ip";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAllowedAdminIp()) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const client = await clientPromise;
  const db = client.db("user_data");
  const users = db.collection("users");

  const docs = await users
    .find(
      {},
      { projection: { username: 1, email: 1, blocked: 1, createdAt: 1 } }
    )
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json({ ok: true, data: docs });
}
