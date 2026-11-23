import type { Metadata } from "next";
import { WishlistPanel } from "@/components/account/AccountPanels";

export const metadata: Metadata = {
  title: "Sản phẩm yêu thích — Đặc sản 3 Miền",
  description: "Các đặc sản bạn đã lưu để mua sau tại Đặc sản 3 Miền.",
};

export default function WishlistPage() {
  return <WishlistPanel />;
}
