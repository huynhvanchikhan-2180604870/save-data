import { verifySession } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ username: string }> } // ✅ fix kiểu Promise
) {
  try {
    const { username } = await context.params; // ✅ phải await

    // Lấy token từ header Authorization
    const auth = req.headers.get("authorization");
    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token)
      return NextResponse.json({ error: "No token" }, { status: 401 });

    // Xác thực token
    const decoded = verifySession(token);
    if (!decoded)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    // Chỉ cho phép user xem data của chính mình
    if (decoded.username !== username)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Kết nối MongoDB
    const client = await clientPromise;
    const db = client.db("user_data");
    const collection = db.collection("records");

    // Lấy tất cả record của user
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

// Cho phép preflight CORS nếu bạn gọi từ domain khác
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
