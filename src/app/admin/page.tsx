import type { Metadata } from "next";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export const metadata: Metadata = { title: "Tổng quan — Quản trị Đặc sản 3 Miền" };

export default function AdminDashboardPage() {
  return (
    <>
      <AdminPageHeader title="Tổng quan" />
      <AdminDashboard />
    </>
  );
}
