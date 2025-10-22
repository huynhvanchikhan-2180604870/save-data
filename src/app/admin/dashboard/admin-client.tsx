"use client";
import { motion } from "framer-motion";
import { Download, RefreshCcw, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

type UserItem = {
  _id?: any;
  username: string;
  email?: string;
  blocked?: boolean;
  createdAt?: string | Date;
};

export default function AdminClient() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyUser, setBusyUser] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const accent = "rgb(59,130,246)"; // tailwind sky-500

  /* ================== Load Data ================== */
  async function loadUsers() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Fetch failed");
      setUsers(json.data || []);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleBlock(username: string, block: boolean) {
    setBusyUser(username);
    try {
      const res = await fetch(
        `/api/admin/users/${encodeURIComponent(username)}/toggle`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ block }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Toggle failed");

      setUsers((prev) =>
        prev.map((u) =>
          u.username === username ? { ...u, blocked: json.data.blocked } : u
        )
      );
    } catch (e: any) {
      alert("Lỗi: " + e.message);
    } finally {
      setBusyUser(null);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  /* ================== UI ================== */
  return (
    <div className="min-h-screen bg-[#0e1218] text-white p-6">
      <style jsx global>{`
        .glass {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 16px;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(9px);
        }
        .btn-solid {
          background: ${accent};
          color: #0b1220;
          font-weight: 600;
        }
        .btn-solid:hover {
          filter: brightness(0.95);
        }
      `}</style>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold" style={{ color: accent }}>
              Admin Dashboard
            </h1>
            <p className="text-sm text-white/70">Quản lý người dùng đăng ký</p>
          </div>
          <button
            onClick={loadUsers}
            className="glass px-4 py-2 rounded-xl inline-flex items-center gap-2 hover:bg-white/15"
          >
            <RefreshCcw size={16} />
            Làm mới
          </button>
        </div>

        {/* Error / Loading */}
        {err && <div className="glass p-4 text-red-400 rounded-xl">{err}</div>}
        {loading && (
          <div className="glass p-6 text-center text-white/70 rounded-xl">
            Đang tải dữ liệu...
          </div>
        )}

        {/* User cards */}
        {!loading && users.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((u) => (
              <motion.div
                key={u.username}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.25 }}
                className="glass p-5 rounded-2xl flex flex-col gap-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-white/70" />
                    <h2
                      className="font-semibold text-lg truncate"
                      style={{ color: accent }}
                    >
                      {u.username}
                    </h2>
                  </div>
                  <span className="text-xs text-white/60">
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString()
                      : "—"}
                  </span>
                </div>

                {/* Body */}
                <div className="text-sm text-white/80 space-y-1">
                  <p>Email: {u.email || "—"}</p>
                  <p>
                    Trạng thái:{" "}
                    {u.blocked ? (
                      <span className="text-red-400 font-medium">Blocked</span>
                    ) : (
                      <span className="text-green-400 font-medium">Active</span>
                    )}
                  </p>
                </div>

                {/* Footer actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => toggleBlock(u.username, !u.blocked)}
                    disabled={busyUser === u.username}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold ${
                      u.blocked
                        ? "btn-solid"
                        : "bg-red-600 hover:bg-red-500 text-white"
                    }`}
                  >
                    {busyUser === u.username
                      ? "Đang xử lý..."
                      : u.blocked
                      ? "Active"
                      : "Block"}
                  </button>

                  <a
                    href={`/api/extension/download?username=${encodeURIComponent(
                      u.username
                    )}`}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold bg-gray-600 hover:bg-gray-500 flex items-center justify-center gap-2"
                  >
                    <Download size={15} /> Tải
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && users.length === 0 && (
          <div className="glass p-6 text-center text-white/60 rounded-xl">
            Chưa có người dùng nào.
          </div>
        )}
      </div>
    </div>
  );
}
