import GiftBoxStarter from "@/components/home/GiftBoxStarter";
import HeroBanner from "@/components/home/HeroBanner";
import ProductTabs from "@/components/home/ProductTabs";
import TodayDeals from "@/components/home/TodayDeals";
import { PageContainer } from "@/components/layout/PageLayout";
import Reveal from "@/components/ui/Reveal";

// Trang chủ, gọn còn các khối chính:
// banner (ảnh các miền) → "Ưu đãi hôm nay" (món đang giảm giá, tự biến mất nếu không có) → "Tất cả sản phẩm" (tab bán chạy / tất cả / ba miền) → ghép hộp quà (2 câu hỏi).
// Hộp quà, sản phẩm… có trang riêng của chúng.
// "Tất cả sản phẩm" đọc sản phẩm và đơn hàng từ localStorage ở trình duyệt.
export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <PageContainer className="pb-16 pt-10 lg:pb-24 lg:pt-14">
        <div className="space-y-16 lg:space-y-20">
          <TodayDeals />
          <Reveal>
            <ProductTabs />
          </Reveal>
          <Reveal>
            <GiftBoxStarter />
          </Reveal>
        </div>
      </PageContainer>
    </>
  );
}
