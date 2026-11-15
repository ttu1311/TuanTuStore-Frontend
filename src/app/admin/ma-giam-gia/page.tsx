import type { Metadata } from "next";
import AdminCoupons from "@/components/admin/AdminCoupons";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export const metadata: Metadata = { title: "Mã giảm giá — Quản trị Đặc sản 3 Miền" };

export default function AdminCouponsPage() {
  return (
    <>
      <AdminPageHeader title="Mã giảm giá" />
      <AdminCoupons />
    </>
  );
}
