import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AccountView from "@/components/account/AccountView";
import RequireLogin from "@/components/auth/RequireLogin";

export const metadata: Metadata = {
  title: "Tài khoản — TuanTuStore",
  description: "Quản lý thông tin tài khoản và đơn hàng của bạn tại TuanTuStore.",
};

type AccountPageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const { tab } = await searchParams;

  return (
    <>
      <Header currentPath="/tai-khoan" />
      <main id="main-content" className="py-10 lg:py-16">
        <div className="mx-auto w-full max-w-container px-4 md:px-6 lg:px-8">
          <h1 className="mb-8 font-display text-3xl font-semibold leading-tight text-ink md:text-title">Tài khoản của tôi</h1>
          {/* Only for logged-in users: visitors are sent to /dang-nhap */}
          <RequireLogin>
            {/* /tai-khoan?tab=orders opens "Đơn hàng của tôi" first */}
            <AccountView initialSection={tab === "orders" ? "orders" : "profile"} />
          </RequireLogin>
        </div>
      </main>
      <Footer />
    </>
  );
}
