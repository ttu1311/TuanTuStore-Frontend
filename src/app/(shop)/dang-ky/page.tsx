import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import RegisterForm from "@/components/auth/RegisterForm";
import { safeNextPath } from "@/lib/redirect";

export const metadata: Metadata = {
  title: "Đăng ký — Đặc sản 3 Miền",
  description: "Tạo tài khoản Đặc sản 3 Miền.",
};

type RegisterPageProps = { searchParams: Promise<{ next?: string | string[] }> };

// ?next=: trang khách đang xem trước khi phải đăng nhập (ví dụ bấm ♡ ở một sản phẩm); xong thì quay lại đó
export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const next = safeNextPath((await searchParams).next) ?? undefined;
  return (
    <AuthCard title="Đăng ký">
      <RegisterForm next={next} />
    </AuthCard>
  );
}
