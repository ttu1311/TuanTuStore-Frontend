import type { Metadata } from "next";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import EditProductView from "@/components/admin/EditProductView";

export const metadata: Metadata = { title: "Sửa sản phẩm — Quản trị TuanTuStore" };

type AdminEditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditProductPage({ params }: AdminEditProductPageProps) {
  const { id } = await params;

  return (
    <>
      <AdminPageHeader title="Sửa sản phẩm" />
      <EditProductView id={id} />
    </>
  );
}
