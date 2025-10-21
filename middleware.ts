import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const path = url.pathname;

  if (path.startsWith("/api/records/")) {
    console.log("Middleware bypassed:", path);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/records/:path*"],
};
