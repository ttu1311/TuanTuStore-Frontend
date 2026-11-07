import type { Metadata } from "next";
import AdminContactTable from "@/components/admin/AdminContactTable";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export const metadata: Metadata = { title: "Yêu cầu liên hệ — Quản trị TuanTuStore" };

export default function AdminContactPage() {
  return (
    <>
      <AdminPageHeader title="Yêu cầu liên hệ" />
      <AdminContactTable />
    </>
  );
}
