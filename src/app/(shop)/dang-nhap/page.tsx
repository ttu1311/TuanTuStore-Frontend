import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import LoginForm from "@/components/auth/LoginForm";
import { safeNextPath } from "@/lib/redirect";

export const metadata: Metadata = {
  title: "Đăng nhập — Đặc sản 3 Miền",
  description: "Đăng nhập vào tài khoản Đặc sản 3 Miền.",
};

type LoginPageProps = { searchParams: Promise<{ next?: string | string[] }> };

// ?next=: trang khách đang xem trước khi phải đăng nhập (ví dụ bấm ♡ ở một sản phẩm); xong thì quay lại đó
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const next = safeNextPath((await searchParams).next) ?? undefined;
  return (
    <AuthCard title="Đăng nhập">
      <LoginForm next={next} />
    </AuthCard>
  );
}
