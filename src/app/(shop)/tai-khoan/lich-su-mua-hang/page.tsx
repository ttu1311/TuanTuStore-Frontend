import type { Metadata } from "next";
import { OrdersPanel } from "@/components/account/AccountPanels";

export const metadata: Metadata = {
  title: "Lịch sử mua hàng — Đặc sản 3 Miền",
  description: "Các đơn hàng đã đặt của bạn tại Đặc sản 3 Miền, mã QR chuyển khoản và đánh giá sản phẩm.",
};

export default function OrdersPage() {
  return <OrdersPanel />;
}
