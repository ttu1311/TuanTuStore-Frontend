import type { Metadata } from "next";
import { PassportPanel } from "@/components/account/AccountPanels";

export const metadata: Metadata = {
  title: "Hộ chiếu đặc sản — Đặc sản 3 Miền",
  description: "Đóng dấu từng tỉnh khi nhận đặc sản, đủ dấu nhận mã giảm giá tại Đặc sản 3 Miền.",
};

export default function PassportPage() {
  return <PassportPanel />;
}
