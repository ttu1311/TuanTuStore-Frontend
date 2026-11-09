import type { Metadata } from "next";
import GiftBoxBuilder from "@/components/gift/GiftBoxBuilder";
import { PageContainer } from "@/components/layout/PageLayout";
import { parseCriteria } from "@/lib/giftBox";

export const metadata: Metadata = {
  title: "Hộp quà Ba Miền — Đặc sản 3 Miền",
  description: "Ghép hộp quà gồm một đặc sản miền Bắc, một miền Trung và một miền Nam theo dịp và ngân sách của bạn, gói chung kèm thiệp.",
};

type GiftBoxPageProps = { searchParams: Promise<{ dip?: string | string[]; "ngan-sach"?: string | string[] }> };

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

// /hop-qua?dip=qua-tet&ngan-sach=100-200: hộp đã ghép sẵn theo dịp và ngân sách (từ 2 câu hỏi ở trang chủ)
export default async function GiftBoxPage({ searchParams }: GiftBoxPageProps) {
  const params = await searchParams;
  const initial = parseCriteria(first(params.dip), first(params["ngan-sach"]));

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
      {/* key: mở trang với dịp hoặc ngân sách khác thì ghép lại từ đầu */}
      <GiftBoxBuilder key={`${initial.occasion}-${initial.budget}`} initial={initial} />
    </PageContainer>
  );
}
