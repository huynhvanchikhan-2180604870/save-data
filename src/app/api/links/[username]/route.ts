import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}

// Public: chỉ trả link display=true và ẩn các field nhạy cảm
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await context.params;
    if (!username) {
      return NextResponse.json(
        { error: "Missing username" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const client = await clientPromise;
    const db = client.db("user_data");
    const links = db.collection("links");

    // ✅ Ẩn _id, username, createdAt, updatedAt, display
    const docs = await links
      .find(
        { username, display: true },
        {
          projection: {
            _id: 0,
            username: 0,
            createdAt: 0,
            updatedAt: 0,
            display: 0,
          },
        }
      )
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(
      { success: true, count: docs.length, data: docs },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("GET /api/links/[username] error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

// POST: tạo link mới cho user
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await context.params;
    const { name, link } = await req.json();

    if (!username)
      return NextResponse.json(
        { error: "Missing username" },
        { status: 400, headers: CORS_HEADERS }
      );
    if (!name || !link) {
      return NextResponse.json(
        { error: "Missing name or link" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const client = await clientPromise;
    const db = client.db("user_data");
    const links = db.collection("links");

    const doc = {
      username,
      name: String(name).trim(),
      link: String(link).trim(),
      display: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await links.insertOne(doc);

    return NextResponse.json(
      { success: true, id: result.insertedId },
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("POST /api/links/[username] error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
