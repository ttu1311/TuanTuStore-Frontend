import type { Metadata } from "next";
import CheckoutView from "@/components/checkout/CheckoutView";
import { PageContainer } from "@/components/layout/PageLayout";

export const metadata: Metadata = {
  title: "Thanh toán — TuanTuStore",
  description: "Thanh toán đơn hàng tại TuanTuStore.",
};

// Khách chưa đăng nhập cũng thanh toán được. Đơn của khách đã đăng nhập được gắn với tài khoản của họ.
export default function CheckoutPage() {
  return (
    <PageContainer>
      <h1 className="mb-8 font-display text-3xl font-semibold leading-tight text-ink md:text-title">Thanh toán</h1>
      <CheckoutView />
    </PageContainer>
  );
}
