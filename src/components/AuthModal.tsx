"use client";

import { Eye, EyeOff, Lock, User } from "lucide-react";
import React from "react";

export default function AuthModal({
  accent = "rgb(59,130,246)",
  mode,
  onClose,
  onSwitchMode,
  onSubmit,
}: {
  accent?: string;
  mode: "login" | "register";
  onClose: () => void;
  onSwitchMode: (m: "login" | "register") => void;
  onSubmit: (
    mode: "login" | "register",
    form: { username: string; password: string }
  ) => Promise<void> | void;
}) {
  const [form, setForm] = React.useState({ username: "", password: "" });
  const [showPass, setShowPass] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) return;
    setLoading(true);
    await onSubmit(mode, form);
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="glass max-w-sm w-full p-6 rounded-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/70 hover:text-white"
          title="Đóng"
        >
          ✕
        </button>

        <h2
          className="text-2xl font-semibold mb-4 text-center"
          style={{ color: accent }}
        >
          {mode === "login" ? "Đăng nhập" : "Đăng ký"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="input-glass px-3 py-2 flex items-center gap-2">
            <User size={16} />
            <input
              value={form.username}
              onChange={(e) =>
                setForm((s) => ({ ...s, username: e.target.value }))
              }
              placeholder="Tên đăng nhập"
              className="w-full bg-transparent outline-none placeholder:text-dim"
            />
          </div>

          <div className="input-glass px-3 py-2 flex items-center gap-2">
            <Lock size={16} />
            <input
              type={showPass ? "text" : "password"}
              value={form.password}
              onChange={(e) =>
                setForm((s) => ({ ...s, password: e.target.value }))
              }
              placeholder="Mật khẩu"
              className="w-full bg-transparent outline-none placeholder:text-dim"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="text-white/60 hover:text-white"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-solid w-full py-2 rounded-xl font-semibold mt-2"
          >
            {loading
              ? "Đang xử lý..."
              : mode === "login"
              ? "Đăng nhập"
              : "Đăng ký"}
          </button>
        </form>

        <p className="text-center text-dim text-sm mt-3">
          {mode === "login" ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
          <button
            type="button"
            onClick={() =>
              onSwitchMode(mode === "login" ? "register" : "login")
            }
            className="text-white/90 hover:underline"
          >
            {mode === "login" ? "Đăng ký" : "Đăng nhập"}
          </button>
        </p>
      </div>
    </div>
  );
}
