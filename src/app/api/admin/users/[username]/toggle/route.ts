// src/app/api/admin/users/[username]/toggle/route.ts
import { isAllowedAdminIp } from "@/lib/ip";
import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ⚠️ LƯU Ý: Ở bản Next của bạn, validator kỳ vọng params là Promise<{ username: string }>
// nên signature phải là ctx: { params: Promise<{ username: string }> } và cần await.
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ username: string }> }
) {
  if (!isAllowedAdminIp()) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  // lấy username từ params (await vì là Promise)
  const { username } = await ctx.params;

  // đọc body
  const body = await req.json().catch(() => ({}));
  const { block } = body as { block?: boolean };

  if (typeof block !== "boolean") {
    return NextResponse.json(
      { error: "Missing 'block' boolean in body" },
      { status: 400 }
    );
  }

  const client = await clientPromise;
  const db = client.db("user_data");
  const users = db.collection("users");

  const res = await users.findOneAndUpdate(
    { username },
    { $set: { blocked: block } },
    { returnDocument: "after" }
  );

  if (!res?.value) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    data: { username, blocked: Boolean(res.value.blocked) },
  });
}
