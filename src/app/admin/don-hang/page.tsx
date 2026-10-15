import type { Metadata } from "next";
import AdminOrderTable from "@/components/admin/AdminOrderTable";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export const metadata: Metadata = { title: "Đơn hàng — Quản trị TuanTuStore" };

export default function AdminOrdersPage() {
  return (
    <>
      <AdminPageHeader title="Đơn hàng" />
      <AdminOrderTable />
    </>
  );
}
