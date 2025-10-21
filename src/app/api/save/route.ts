import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data } = body;

    if (!data || typeof data !== "string") {
      return NextResponse.json(
        { error: "Chuỗi dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    // Tách chuỗi theo dấu |
    const parts = data.split("|");

    if (parts.length !== 10) {
      return NextResponse.json(
        { error: "Chuỗi dữ liệu phải có đủ 10 phần tử phân tách bởi dấu |" },
        { status: 400 }
      );
    }

    // Parse dữ liệu
    const record = {
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
      createdAt: new Date(),
      rawData: data, // Lưu cả chuỗi gốc để tham khảo
    };

    // Kết nối MongoDB và lưu dữ liệu
    const client = await clientPromise;
    const db = client.db("user_data");
    const collection = db.collection("records");

    const result = await collection.insertOne(record);

    return NextResponse.json(
      {
        success: true,
        message: "Dữ liệu đã được lưu thành công",
        id: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Lỗi khi lưu dữ liệu:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi lưu dữ liệu" },
      { status: 500 }
    );
  }
}

// Cho phép CORS từ mọi nguồn
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
