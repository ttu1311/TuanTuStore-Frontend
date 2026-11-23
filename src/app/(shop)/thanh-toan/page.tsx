import type { Metadata } from "next";
import RequireLogin from "@/components/auth/RequireLogin";
import CheckoutView from "@/components/checkout/CheckoutView";
import { PageContainer } from "@/components/layout/PageLayout";

export const metadata: Metadata = {
  title: "Thanh toán — Đặc sản 3 Miền",
  description: "Thanh toán đơn hàng tại Đặc sản 3 Miền.",
};

// BẮT BUỘC ĐĂNG NHẬP mới được thanh toán: khách chưa đăng nhập bị chuyển tới /dang-nhap rồi quay lại đây (giỏ hàng được giữ nguyên).
// Xem cũng placeOrder trong src/context/StoreContext.tsx. Đây là bản demo front-end: lớp chặn này cải thiện trải nghiệm chứ không phải bảo mật thật.
export default function CheckoutPage() {
  return (
    <PageContainer>
      <h1 className="mb-8 font-display text-3xl font-semibold leading-tight text-ink md:text-title">Thanh toán</h1>
      <RequireLogin>
        <CheckoutView />
      </RequireLogin>
    </PageContainer>
  );
}
