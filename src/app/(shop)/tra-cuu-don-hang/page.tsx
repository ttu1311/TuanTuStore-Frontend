import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageLayout";
import OrderLookup from "@/components/orders/OrderLookup";

export const metadata: Metadata = {
  title: "Tra cứu đơn hàng — TuanTuStore",
  description: "Xem trạng thái đơn hàng bằng mã đơn và số điện thoại, không cần đăng nhập.",
};

type OrderLookupPageProps = { searchParams: Promise<{ ma?: string | string[] }> };

// /tra-cuu-don-hang?ma=TT-000001: trang "Đặt hàng thành công" mở sẵn mã đơn, khách chỉ cần nhập số điện thoại
export default async function OrderLookupPage({ searchParams }: OrderLookupPageProps) {
  const { ma } = await searchParams;
  const initialCode = ((Array.isArray(ma) ? ma[0] : ma) ?? "").trim().slice(0, 20);

  return (
    <PageContainer>
      <div className="mb-10">
        <h1 className="font-display text-3xl/[1.1] font-semibold text-ink md:text-title/[1.1]">Tra cứu đơn hàng</h1>
        <p className="mt-3 max-w-[40rem] text-ink-muted">
          Nhập mã đơn hàng và số điện thoại bạn đã dùng khi đặt để xem đơn đang ở bước nào.
        </p>
      </div>
      {/* key: mở trang với mã đơn khác thì ô mã đơn bắt đầu lại với mã đó */}
      <OrderLookup key={initialCode} initialCode={initialCode} />
    </PageContainer>
  );
}
