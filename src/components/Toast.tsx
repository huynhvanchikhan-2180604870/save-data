"use client";

import React from "react";

export default function Toast({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
      <div className="glass px-4 py-2 rounded-xl text-sm flex items-center gap-2">
        {children}
      </div>
    </div>
  );
}
