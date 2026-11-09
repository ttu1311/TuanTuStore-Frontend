import type { Metadata } from "next";
import AccountView from "@/components/account/AccountView";
import RequireLogin from "@/components/auth/RequireLogin";
import { PageContainer } from "@/components/layout/PageLayout";

export const metadata: Metadata = {
  title: "Tài khoản — Đặc sản 3 Miền",
  description: "Quản lý thông tin tài khoản và đơn hàng của bạn tại Đặc sản 3 Miền.",
};

type AccountPageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const { tab } = await searchParams;

  return (
    <PageContainer>
      <h1 className="mb-8 font-display text-3xl font-semibold leading-tight text-ink md:text-title">Tài khoản của tôi</h1>
      {/* Chỉ dành cho người đã đăng nhập: khách chưa đăng nhập bị chuyển tới /dang-nhap */}
      <RequireLogin>
        {/* /tai-khoan?tab=orders mở "Đơn hàng của tôi" trước, ?tab=wishlist "Sản phẩm yêu thích", ?tab=passport "Hộ chiếu đặc sản" */}
        <AccountView initialSection={tab === "orders" || tab === "wishlist" || tab === "passport" ? tab : "profile"} />
      </RequireLogin>
    </PageContainer>
  );
}
