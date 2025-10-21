import clientPromise from "../../../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ username: string; id: string }> }
) {
  try {
    const { username, id } = await context.params;
    const body = await req.json();
    const display = body?.display;

    if (!username)
      return NextResponse.json(
        { error: "Missing username" },
        { status: 400, headers: CORS_HEADERS }
      );
    if (!ObjectId.isValid(id))
      return NextResponse.json(
        { error: "Invalid id" },
        { status: 400, headers: CORS_HEADERS }
      );
    if (typeof display !== "boolean")
      return NextResponse.json(
        { error: "Missing or invalid 'display' (boolean)" },
        { status: 400, headers: CORS_HEADERS }
      );

    const client = await clientPromise;
    const db = client.db("user_data");
    const links = db.collection("links");

    const { matchedCount, modifiedCount } = await links.updateOne(
      { _id: new ObjectId(id), username },
      { $set: { display, updatedAt: new Date() } }
    );

    if (!matchedCount) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, modified: modifiedCount > 0 },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("PATCH /api/links/[username]/[id] error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
