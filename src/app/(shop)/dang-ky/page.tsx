import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Đăng ký — TuanTuStore",
  description: "Tạo tài khoản TuanTuStore.",
};

export default function RegisterPage() {
  return (
    <AuthCard title="Đăng ký">
      <RegisterForm />
    </AuthCard>
  );
}
