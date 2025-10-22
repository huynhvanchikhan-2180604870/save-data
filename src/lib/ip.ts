// src/lib/ip.ts
import { headers } from "next/headers";

/**
 * Lấy IP thực tế của request (x-forwarded-for, x-real-ip, hoặc remoteAddr)
 */
export async function getClientIp(): Promise<string | null> {
  try {
    // ❗ Bắt buộc await ở Next.js 15+
    const h = await headers();

    const xff = h.get("x-forwarded-for");
    if (xff) return xff.split(",")[0].trim();

    const xr = h.get("x-real-ip");
    if (xr) return xr.trim();

    return null;
  } catch (e) {
    console.error("getClientIp error:", e);
    return null;
  }
}

/**
 * Kiểm tra xem IP hiện tại có nằm trong danh sách admin hay không
 */
export async function isAllowedAdminIp(): Promise<boolean> {
  const ip = await getClientIp();
  const allowed = ["118.70.145.178"]; // ✅ IP bạn cho phép
  return ip ? allowed.includes(ip) : false;
}
