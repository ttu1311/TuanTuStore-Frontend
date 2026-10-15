import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Đăng ký — TuanTuStore",
  description: "Tạo tài khoản TuanTuStore.",
};

export default function RegisterPage() {
  return (
    <>
      <Header currentPath="/dang-ky" />
      <main id="main-content" className="py-10 lg:py-16">
        <div className="mx-auto w-full max-w-[480px] px-4 md:px-6">
          <div className="rounded-xl border border-line bg-white p-6 md:p-8">
            <h1 className="mb-6 font-display text-3xl font-semibold leading-tight text-ink">Đăng ký</h1>
            <RegisterForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
