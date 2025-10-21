"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Copy,
  CreditCard,
  Download,
  FileText,
  KeyRound,
  Landmark,
  Lock,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Phone,
  RefreshCcw,
  ShieldCheck,
  User,
  UserPlus,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

/* ================== Types ================== */
type RecordItem = {
  hoVaTen: string;
  soTaiKhoan: string;
  tenNganHang: string;
  chiNhanh: string;
  tenDangNhap: string;
  nickname: string;
  soPhien: string;
  soDienThoai: string;
  email: string;
  ngaySinh: string;
  rawData: string;
  createdAt: string;
};

type AuthMode = "login" | "register";

/* ================== Page ================== */
export default function RecordsDashboard() {
  // Accent: 1 màu, không neon/gradient
  const accent = "rgb(59,130,246)"; // tailwind sky-500

  // Auth
  const [isAuthed, setIsAuthed] = useState(false);
  const [username, setUsername] = useState<string>("");

  // Data/UI
  const [data, setData] = useState<RecordItem[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState("");
  const [toast, setToast] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  /* ================== Helpers ================== */
  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 1600);
  }

  async function copyText(t: string) {
    try {
      await navigator.clipboard.writeText(t);
      setCopied(t);
      setTimeout(() => setCopied(""), 1100);
    } catch {
      // ignore
    }
  }

  function getToken(): string | null {
    try {
      return localStorage.getItem("token");
    } catch {
      return null;
    }
  }

  /* ================== Auth Calls ================== */
  async function doLogin(user: string, pass: string) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, password: pass }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || "Login failed");

    // Lưu token vào localStorage để giữ phiên
    if (json?.token) localStorage.setItem("token", json.token);

    return { username: json?.username ?? user };
  }

  async function doRegister(user: string, pass: string) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, password: pass }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || "Register failed");
    return { username: json?.username ?? user };
  }

  async function doLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    } catch {}
    localStorage.removeItem("token");
    setIsAuthed(false);
    setUsername("");
    setData([]);
    showToast("Đã đăng xuất");
  }

  async function fetchProfile(): Promise<string | null> {
    const token = getToken();
    if (!token) return null;

    const res = await fetch("/api/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      localStorage.removeItem("token");
      return null;
    }
    const json = await res.json();
    return json?.username ?? null;
  }

  /* ================== Data Fetch ================== */
  async function fetchUserRecords(user: string) {
    if (!user) return;
    const token = getToken();
    if (!token) {
      setIsAuthed(false);
      setUsername("");
      return;
    }
    console.log("Fetching records for", user);
    try {
      setLoading(true);
      const res = await fetch(`/api/records/${encodeURIComponent(user)}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Fetch failed");
      const payload = json?.data ?? json;
      setData(Array.isArray(payload) ? payload : [payload]);
    } catch (e: any) {
      setData([]);
      showToast(e?.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  // Khi load trang → auto-restore phiên từ localStorage
  useEffect(() => {
    (async () => {
      const token = getToken();
      if (!token) return; // chưa đăng nhập
      const user = await fetchProfile();
      if (user) {
        setUsername(user);
        setIsAuthed(true);
        fetchUserRecords(user);
      } else {
        localStorage.removeItem("token");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Search
  const filtered = useMemo(() => {
    const term = q.toLowerCase().trim();
    return term
      ? data.filter((r) =>
          Object.values(r).some((v) => String(v).toLowerCase().includes(term))
        )
      : data;
  }, [q, data]);

  // Reset page khi thay đổi từ khóa/pageSize
  useEffect(() => {
    setPage(1);
  }, [q, pageSize]);

  // Pagination calc
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const pageData = filtered.slice(startIdx, endIdx);

  // Download ZIP theo username
  const startDownload = async () => {
    if (!isAuthed || !username) {
      showToast("Vui lòng đăng nhập để tải file của bạn.");
      setModalOpen(true);
      setAuthMode("login");
      return;
    }
    const zipPath = `/${encodeURIComponent(username)}.zip`;
    try {
      const head = await fetch(zipPath, { method: "HEAD", cache: "no-store" });
      if (!head.ok) {
        setErrorMsg(
          `Không tìm thấy file "${username}.zip" trong thư mục public.`
        );
        return;
      }
      const a = document.createElement("a");
      a.href = zipPath;
      a.download = `${username}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      setErrorMsg(
        "Không thể kiểm tra/tải file. Kiểm tra lại kết nối hoặc tên file."
      );
    }
  };

  /* ================== UI ================== */
  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8 bg-[#0e1218] text-white relative">
      {/* glass utilities */}
      <style jsx global>{`
        .glass {
          background: rgba(255, 255, 255, 0.21);
          border-radius: 16px;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(9.4px);
          -webkit-backdrop-filter: blur(9.4px);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        .text-muted {
          color: rgba(255, 255, 255, 0.86);
        }
        .text-dim {
          color: rgba(255, 255, 255, 0.55);
        }
        .icon-dim {
          color: rgba(255, 255, 255, 0.65);
        }
        .btn-outline {
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.1);
        }
        .btn-outline:hover {
          background: rgba(255, 255, 255, 0.16);
        }
        .btn-solid {
          background: ${accent};
          color: #0b1220;
        }
        .btn-solid:hover {
          filter: brightness(0.95);
        }
      `}</style>

      <div className="mx-auto w-full max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1
              className="text-2xl sm:text-3xl font-semibold tracking-tight"
              style={{ color: accent }}
            >
              Records Dashboard
            </h1>
            <p className="text-dim text-sm mt-1">
              Liquid Glass · Mono Color · Professional
            </p>
          </div>

          {/* Buttons group — responsive: full width on mobile */}
          <div className="grid grid-cols-2 sm:flex gap-2 items-center w-full sm:w-auto">
            {isAuthed ? (
              <>
                <div className="glass px-3 py-2 rounded-xl text-sm text-muted flex items-center gap-2 col-span-2 sm:col-span-1 w-full sm:w-auto">
                  <ShieldCheck size={16} className="icon-dim" />
                  <span className="font-medium">{username}</span>
                </div>
                <button
                  onClick={() => fetchUserRecords(username)}
                  className="glass btn-outline px-4 py-2 rounded-xl flex items-center gap-2 w-full sm:w-auto"
                  title="Làm mới dữ liệu"
                >
                  <RefreshCcw size={16} className="icon-dim" />
                  <span className="text-muted">Làm mới</span>
                </button>
                <button
                  onClick={startDownload}
                  className="btn-solid px-4 py-2 rounded-xl w-full sm:w-auto"
                  title="Tải bản ZIP theo username"
                >
                  <span className="inline-flex items-center gap-2 font-semibold">
                    <Download size={16} /> Tải bản mới
                  </span>
                </button>
                <button
                  onClick={doLogout}
                  className="glass btn-outline px-4 py-2 rounded-xl flex items-center gap-2 w-full sm:w-auto"
                  title="Đăng xuất"
                >
                  <LogOut size={16} className="icon-dim" />
                  <span className="text-muted">Đăng xuất</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setAuthMode("login");
                    setModalOpen(true);
                  }}
                  className="glass btn-outline px-4 py-2 rounded-xl flex items-center gap-2 w-full sm:w-auto"
                  title="Đăng nhập"
                >
                  <LogIn size={16} className="icon-dim" />
                  <span className="text-muted">Đăng nhập</span>
                </button>
                <button
                  onClick={() => {
                    setAuthMode("register");
                    setModalOpen(true);
                  }}
                  className="btn-solid px-4 py-2 rounded-xl w-full sm:w-auto"
                  title="Đăng ký"
                >
                  <span className="inline-flex items-center gap-2 font-semibold">
                    <UserPlus size={16} /> Đăng ký
                  </span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Error banner khi tải ZIP thất bại */}
        {errorMsg && (
          <div className="glass px-4 py-3 rounded-xl text-sm bg-white/80 border border-white/30 text-black">
            <div className="flex items-start justify-between gap-3">
              <div className="text-black/80">{errorMsg}</div>
              <button
                onClick={() => setErrorMsg("")}
                className="px-2 py-1 rounded-lg text-black/60 hover:text-black/80"
                title="Đóng"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Toolbar: Search + page size */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="glass px-3 sm:px-4 py-2 rounded-2xl w-full sm:max-w-md">
            <div className="flex items-center gap-2">
              <User size={16} className="icon-dim" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm kiếm: tên, STK, ngân hàng, SĐT, email..."
                className="w-full bg-transparent outline-none placeholder:text-dim text-sm"
                disabled={!isAuthed}
              />
            </div>
          </div>

          <div className="glass px-3 py-2 rounded-2xl flex items-center justify-between sm:justify-start gap-3">
            <span className="text-dim text-sm">Hiển thị</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-transparent outline-none text-sm text-white"
              disabled={!isAuthed}
            >
              <option value={12} className="bg-[#0e1218]">
                12
              </option>
              <option value={24} className="bg-[#0e1218]">
                24
              </option>
              <option value={48} className="bg-[#0e1218]">
                48
              </option>
            </select>
            <span className="text-dim text-sm">/ trang</span>
            {isAuthed && (
              <span className="hidden sm:inline text-dim text-sm">
                · Tổng <span className="text-white">{filtered.length}</span>
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        {!isAuthed ? (
          <EmptyState accent={accent} />
        ) : loading ? (
          <SkeletonGrid />
        ) : total === 0 ? (
          <div className="glass p-8 rounded-2xl text-center text-dim">
            Không có dữ liệu phù hợp.
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {pageData.map((r, i) => (
                <motion.div
                  key={`${r.soTaiKhoan}-${i}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.25 }}
                  className="glass p-4 sm:p-5 rounded-2xl"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <User size={18} className="icon-dim" />
                      <h2
                        className="text-base font-semibold"
                        style={{ color: accent }}
                      >
                        {r.hoVaTen}
                      </h2>
                    </div>
                    <span className="text-xs text-dim whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="mt-3 grid grid-cols-1 gap-1.5 text-sm">
                    <Info
                      label="Số TK"
                      icon={<CreditCard size={15} />}
                      value={r.soTaiKhoan}
                      onCopy={copyText}
                    />
                    <Info
                      label="Ngân hàng"
                      icon={<Landmark size={15} />}
                      value={r.tenNganHang}
                      onCopy={copyText}
                    />
                    <Info
                      label="Chi nhánh"
                      icon={<MapPin size={15} />}
                      value={r.chiNhanh}
                      onCopy={copyText}
                    />
                    <Info
                      label="Đăng nhập"
                      icon={<KeyRound size={15} />}
                      value={r.tenDangNhap}
                      onCopy={copyText}
                    />
                    <Info
                      label="Mật khẩu"
                      icon={<Lock size={15} />}
                      value={r.nickname}
                      onCopy={copyText}
                    />
                    <Info
                      label="Rút tiền"
                      icon={<KeyRound size={15} />}
                      value={r.soPhien}
                      onCopy={copyText}
                    />
                    <Info
                      label="SĐT"
                      icon={<Phone size={15} />}
                      value={r.soDienThoai}
                      onCopy={copyText}
                    />
                    <Info
                      label="Email"
                      icon={<Mail size={15} />}
                      value={r.email}
                      onCopy={copyText}
                    />
                    <Info
                      label="Ngày sinh"
                      icon={<Calendar size={15} />}
                      value={r.ngaySinh}
                      onCopy={copyText}
                    />
                    <Info
                      label="RawData"
                      icon={<FileText size={15} />}
                      value={r.rawData}
                      onCopy={copyText}
                      truncateLines={2}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
              <div className="text-sm text-dim">
                Hiển thị{" "}
                <span className="text-white">
                  {total === 0 ? 0 : startIdx + 1}
                </span>
                –<span className="text-white">{endIdx}</span> /{" "}
                <span className="text-white">{total}</span> bản ghi
              </div>

              <div className="glass px-2 py-1 rounded-2xl inline-flex items-center gap-1 w-full sm:w-auto justify-center">
                <PgBtn
                  onClick={() => setPage(1)}
                  disabled={currentPage === 1}
                  title="Trang đầu"
                >
                  <ChevronsLeft size={16} />
                </PgBtn>
                <PgBtn
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  title="Trang trước"
                >
                  <ChevronLeft size={16} />
                </PgBtn>

                <span className="px-3 text-sm">
                  <span className="text-white">{currentPage}</span>
                  <span className="text-dim"> / {totalPages}</span>
                </span>

                <PgBtn
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  title="Trang sau"
                >
                  <ChevronRight size={16} />
                </PgBtn>
                <PgBtn
                  onClick={() => setPage(totalPages)}
                  disabled={currentPage === totalPages}
                  title="Trang cuối"
                >
                  <ChevronsRight size={16} />
                </PgBtn>
              </div>
            </div>
          </>
        )}

        {/* Toasts */}
        {copied && (
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40">
            <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
              <Copy size={14} className="icon-dim" />
              <span className="text-muted">
                Đã copy: <span className="font-mono text-white">{copied}</span>
              </span>
            </div>
          </div>
        )}
        {toast && (
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 translate-y-12 z-40">
            <div className="glass px-4 py-2 rounded-xl text-sm text-muted">
              {toast}
            </div>
          </div>
        )}
      </div>

      {/* ====== Auth Modal (username + password) ====== */}
      {modalOpen && (
        <AuthModal
          accent={accent}
          mode={authMode}
          onClose={() => setModalOpen(false)}
          onSwitchMode={(m) => setAuthMode(m)}
          onSubmit={async (mode, form) => {
            try {
              let info: { username: string };
              if (mode === "register") {
                await doRegister(form.username, form.password);
                info = await doLogin(form.username, form.password); // auto login
              } else {
                info = await doLogin(form.username, form.password);
              }
              setIsAuthed(true);
              setUsername(info.username);
              setModalOpen(false);
              showToast("Đăng nhập thành công");
              // nạp data ngay
              fetchUserRecords(info.username);
            } catch (e: any) {
              showToast(e?.message || "Thao tác thất bại");
            }
          }}
        />
      )}
    </div>
  );
}

/* ================== Reusable pieces ================== */
function EmptyState({ accent }: { accent: string }) {
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
          Hãy đăng nhập để xem & quản lý các bản ghi của bạn. Giao diện tối
          giản, liquid glass, tối ưu cho di động.
        </p>
      </div>
    </div>
  );
}

function SkeletonGrid() {
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

function Info({
  icon,
  label,
  value,
  onCopy,
  truncateLines = 1,
}: {
  icon: React.ReactNode;

  label: string;
  value: string;
  onCopy: (t: string) => void;
  truncateLines?: 1 | 2 | 3;
}) {
  return (
    <div
      className="flex items-start justify-between gap-3 cursor-pointer group"
      onClick={() => onCopy(value)}
      title="Nhấn để copy"
    >
      <div className="flex items-center gap-2 text-dim group-hover:text-muted transition">
        {icon}
        <span>{label}</span>
      </div>
      <span
        className="text-sm text-white/90 font-medium text-right"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: truncateLines,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          maxWidth: "62%",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function PgBtn({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`px-2.5 py-1.5 rounded-xl inline-flex items-center justify-center ${
        disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-white/15"
      }`}
      style={{
        border: "1px solid rgba(255,255,255,0.18)",
        background: "rgba(255,255,255,0.10)",
      }}
    >
      {children}
    </button>
  );
}

/* ================== Auth Modal ================== */
function AuthModal({
  mode,
  accent,
  onClose,
  onSwitchMode,
  onSubmit,
}: {
  mode: "login" | "register";
  accent: string;
  onClose: () => void;
  onSwitchMode: (m: AuthMode) => void;
  onSubmit: (
    mode: AuthMode,
    form: { username: string; password: string }
  ) => Promise<void>;
}) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.username || !form.password) return;
    setSubmitting(true);
    try {
      await onSubmit(mode, form);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass w-full max-w-md rounded-2xl p-6 relative"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold" style={{ color: accent }}>
            {mode === "login" ? "Đăng nhập" : "Đăng ký"}
          </h3>
          <button
            onClick={onClose}
            className="text-dim hover:text-muted transition px-2 py-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Field
            label="Tài khoản"
            placeholder="vd: johndoe"
            value={form.username}
            onChange={(v) => setForm((s) => ({ ...s, username: v }))}
          />
          <Field
            label="Mật khẩu"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(v) => setForm((s) => ({ ...s, password: v }))}
          />

          <div className="flex items-center justify-between pt-2 gap-3">
            <button
              type="button"
              className="text-sm text-dim hover:text-muted underline-offset-4 hover:underline"
              onClick={() =>
                onSwitchMode(mode === "login" ? "register" : "login")
              }
            >
              {mode === "login"
                ? "Chưa có tài khoản? Đăng ký"
                : "Đã có tài khoản? Đăng nhập"}
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="btn-solid px-4 py-2 rounded-xl font-semibold"
              style={{ background: accent, color: "#0b1220" }}
            >
              <span className="inline-flex items-center gap-2">
                {mode === "login" ? (
                  <LogIn size={16} />
                ) : (
                  <UserPlus size={16} />
                )}
                {submitting
                  ? "Đang xử lý..."
                  : mode === "login"
                  ? "Đăng nhập"
                  : "Đăng ký"}
              </span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <div className="text-sm text-dim mb-1">{label}</div>
      <div className="glass px-3 py-2 rounded-xl">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none placeholder:text-dim"
        />
      </div>
    </div>
  );
}
