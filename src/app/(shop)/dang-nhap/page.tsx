import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Đăng nhập — TuanTuStore",
  description: "Đăng nhập vào tài khoản TuanTuStore.",
};

export default function LoginPage() {
  return (
    <AuthCard title="Đăng nhập">
      <LoginForm />
    </AuthCard>
  );
}
