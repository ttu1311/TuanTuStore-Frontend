import type { Metadata } from "next";
import { PasswordPanel } from "@/components/account/AccountPanels";

export const metadata: Metadata = {
  title: "Đổi mật khẩu — Đặc sản 3 Miền",
  description: "Đổi mật khẩu tài khoản của bạn tại Đặc sản 3 Miền.",
};

export default function PasswordPage() {
  return <PasswordPanel />;
}
