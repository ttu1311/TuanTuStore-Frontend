import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Đăng nhập — TuanTuStore",
  description: "Đăng nhập vào tài khoản TuanTuStore.",
};

export default function LoginPage() {
  return (
    <>
      <Header currentPath="/dang-nhap" />
      <main id="main-content" className="py-10 lg:py-16">
        <div className="mx-auto w-full max-w-[480px] px-4 md:px-6">
          <div className="rounded-xl border border-line bg-white p-6 md:p-8">
            <h1 className="mb-6 font-display text-3xl font-semibold leading-tight text-ink">Đăng nhập</h1>
            <LoginForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
