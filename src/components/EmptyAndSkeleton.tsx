"use client";

import { User } from "lucide-react";

export function EmptyState({
  accent = "rgb(59,130,246)",
}: {
  accent?: string;
}) {
  return (
    <div className="glass p-8 sm:p-10 rounded-2xl text-center">
      <div className="mx-auto max-w-md space-y-3">
        <div
          className="inline-flex items-center justify-center w-12 h-12 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.14)" }}
        >
          <User size={22} />
        </div>
        <h3 className="text-lg font-semibold" style={{ color: accent }}>
          Chào mừng!
        </h3>
        <p className="text-dim text-sm">
          Hãy đăng nhập để xem & quản lý dữ liệu. Giao diện liquid glass, tối ưu
          di động.
        </p>
      </div>
    </div>
  );
}

export function SkeletonGrid() {
  return (
    <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="glass p-5 rounded-2xl animate-pulse">
          <div className="h-4 w-40 bg-white/20 rounded mb-4" />
          <div className="space-y-2">
            <div className="h-3 w-3/4 bg-white/15 rounded" />
            <div className="h-3 w-2/3 bg-white/15 rounded" />
            <div className="h-3 w-5/6 bg-white/15 rounded" />
            <div className="h-3 w-1/2 bg-white/15 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
