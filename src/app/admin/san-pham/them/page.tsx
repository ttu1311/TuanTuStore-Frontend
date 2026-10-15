import type { Metadata } from "next";
import AddProductView from "@/components/admin/AddProductView";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export const metadata: Metadata = { title: "Thêm sản phẩm — Quản trị TuanTuStore" };

export default function AdminAddProductPage() {
  return (
    <>
      <AdminPageHeader title="Thêm sản phẩm" />
      <AddProductView />
    </>
  );
}
