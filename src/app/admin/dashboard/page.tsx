import { isAllowedAdminIp } from "@/lib/ip";
import AdminClient from "./admin-client";

export default function Page() {
  if (!isAllowedAdminIp()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e1218] text-white">
        <div className="p-8 rounded-2xl bg-[#1a1f2a]">
          <h2 className="text-xl font-semibold mb-3">Access Denied</h2>
          <p>Chỉ IP được phép mới truy cập được trang này.</p>
        </div>
      </div>
    );
  }

  return <AdminClient />;
}
