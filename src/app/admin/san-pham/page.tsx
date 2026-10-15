import type { Metadata } from "next";
import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminProductTable from "@/components/admin/AdminProductTable";
import { btnBase, btnPrimary, btnSmall } from "@/components/ui/buttons";

export const metadata: Metadata = { title: "Sản phẩm — Quản trị TuanTuStore" };

export default function AdminProductsPage() {
  return (
    <>
      <AdminPageHeader title="Sản phẩm">
        <Link href="/admin/san-pham/them" className={`${btnBase} ${btnPrimary} ${btnSmall}`}>
          Thêm sản phẩm
        </Link>
      </AdminPageHeader>
      <AdminProductTable />
    </>
  );
}
