import clientPromise from "../../../lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("user_data");
    const collection = db.collection("records");

    // Lấy tất cả records, sắp xếp theo thời gian tạo mới nhất
    const records = await collection.find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(
      {
        success: true,
        count: records.length,
        data: records,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi lấy dữ liệu" },
      { status: 500 }
    );
  }
}

// Cho phép CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
