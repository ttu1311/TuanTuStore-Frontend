import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Quản trị — TuanTuStore",
  robots: { index: false },
};

// Layout shared by every /admin page. AdminShell shows the content only to an ADMIN.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
