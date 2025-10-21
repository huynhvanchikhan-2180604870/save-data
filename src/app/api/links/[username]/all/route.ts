import clientPromise from "../../../../../lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

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

    const client = await clientPromise;
    const db = client.db("user_data");
    const links = db.collection("links");

    const docs = await links
      .find({ username })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(
      { success: true, count: docs.length, data: docs },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("GET /api/links/[username]/all error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
