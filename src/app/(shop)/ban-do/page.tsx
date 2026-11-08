import type { Metadata } from "next";
import VietnamMapSection from "@/components/home/VietnamMapSection";
import { PageContainer } from "@/components/layout/PageLayout";

export const metadata: Metadata = {
  title: "Bản đồ đặc sản — Đặc sản 3 Miền",
  description: "Bản đồ ba miền và các tỉnh có đặc sản tại Đặc sản 3 Miền, xếp từ Bắc vào Nam.",
};

// Bản đồ ba miền (trước đây ở sidebar trang chủ). Mục "Bản đồ" trên menu mở trang này.
export default function MapPage() {
  return (
    <PageContainer>
      <div className="mb-10">
        <h1 className="font-display text-3xl/[1.1] font-semibold text-ink md:text-title/[1.1]">Bản đồ đặc sản</h1>
        <p className="mt-3 max-w-[40rem] text-ink-muted">
          Bấm vào một miền hoặc một chấm tỉnh trên bản đồ để xem đặc sản nơi đó. Các tỉnh dùng tên sau sáp nhập (34 tỉnh,
          thành), xếp từ Bắc vào Nam theo vĩ độ.
        </p>
      </div>
      <VietnamMapSection />
    </PageContainer>
  );
}
