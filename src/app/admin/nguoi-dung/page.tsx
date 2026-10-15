import type { Metadata } from "next";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminUserTable from "@/components/admin/AdminUserTable";

export const metadata: Metadata = { title: "Người dùng — Quản trị TuanTuStore" };

export default function AdminUsersPage() {
  return (
    <>
      <AdminPageHeader title="Người dùng" />
      <AdminUserTable />
    </>
  );
}
