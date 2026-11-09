import type { Metadata } from "next";
import CartView from "@/components/cart/CartView";
import { PageContainer } from "@/components/layout/PageLayout";

export const metadata: Metadata = {
  title: "Giỏ hàng — Đặc sản 3 Miền",
  description: "Giỏ hàng của bạn tại Đặc sản 3 Miền.",
};

export default function CartPage() {
  return (
    <PageContainer>
      <h1 className="mb-8 font-display text-3xl font-semibold leading-tight text-ink md:text-title">Giỏ hàng</h1>
      <CartView />
    </PageContainer>
  );
}
