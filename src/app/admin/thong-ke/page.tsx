import type { Metadata } from "next";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminProductStats from "@/components/admin/AdminProductStats";

export const metadata: Metadata = { title: "Thống kê sản phẩm — Quản trị Đặc sản 3 Miền" };

export default function AdminStatsPage() {
  return (
    <>
      <AdminPageHeader title="Thống kê theo sản phẩm" />
      <AdminProductStats />
    </>
  );
}
