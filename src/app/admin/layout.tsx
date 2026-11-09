import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Quản trị — Đặc sản 3 Miền",
  robots: { index: false },
};

// Layout dùng chung cho mọi trang /admin. AdminShell chỉ hiển thị nội dung cho ADMIN.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
