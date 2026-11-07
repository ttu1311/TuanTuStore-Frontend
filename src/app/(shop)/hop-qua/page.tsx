import type { Metadata } from "next";
import GiftBoxBuilder from "@/components/gift/GiftBoxBuilder";
import { PageContainer } from "@/components/layout/PageLayout";

export const metadata: Metadata = {
  title: "Hộp quà Ba Miền — TuanTuStore",
  description: "Tự ghép hộp quà gồm một đặc sản miền Bắc, một miền Trung và một miền Nam, gói chung kèm thiệp.",
};

export default function GiftBoxPage() {
  return (
    <PageContainer>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-ink">Quà tặng</p>
        <h1 className="mt-2 font-display text-4xl/[1.1] font-bold text-ink md:text-title/[1.1]">Hộp quà Ba Miền</h1>
        <p className="mt-3 max-w-[40rem] text-lg text-ink-muted">
          Một món của đất Bắc, một món của miền Trung, một món của phương Nam, gói chung một hộp kèm thiệp viết tay lời nhắn
          của bạn.
        </p>
      </div>
      <GiftBoxBuilder />
    </PageContainer>
  );
}
