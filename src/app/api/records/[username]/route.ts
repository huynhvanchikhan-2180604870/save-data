import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Cho phép preflight CORS
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await context.params;

    if (!username)
      return NextResponse.json(
        { error: "Missing username" },
        { status: 400, headers: CORS_HEADERS }
      );

    // Kết nối MongoDB
    const client = await clientPromise;
    const db = client.db("user_data");
    const collection = db.collection("records");

    // Tìm tất cả bản ghi theo username
    const records = await collection
      .find({ username })
      .sort({ createdAt: -1 })
      .toArray();

    if (!records.length) {
      return NextResponse.json(
        { success: true, count: 0, data: [] },
        { status: 200, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, count: records.length, data: records },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Fetch records error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
