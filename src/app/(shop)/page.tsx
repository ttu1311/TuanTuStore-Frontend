import AboutSection from "@/components/home/AboutSection";
import GiftBoxStarter from "@/components/home/GiftBoxStarter";
import HeroBanner from "@/components/home/HeroBanner";
import ProductTabs from "@/components/home/ProductTabs";
import { PageContainer } from "@/components/layout/PageLayout";
import Reveal from "@/components/ui/Reveal";

// Trang chủ, gọn còn các khối chính:
// banner (3 slide: chọn quà, hộp quà, ưu đãi) → "Tất cả sản phẩm" (tab bán chạy / tất cả / ba miền) → ghép hộp quà (2 câu hỏi) → giới thiệu ngắn.
// Bản đồ có trang riêng (/ban-do); hộp quà, dịp tặng, sản phẩm… vẫn có trang của chúng.
// "Tất cả sản phẩm" đọc sản phẩm và đơn hàng từ localStorage ở trình duyệt.
export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <PageContainer className="pb-16 pt-10 lg:pb-24 lg:pt-14">
        <div className="space-y-16 lg:space-y-20">
          <Reveal>
            <ProductTabs />
          </Reveal>
          <Reveal>
            <GiftBoxStarter />
          </Reveal>
          <Reveal>
            <AboutSection />
          </Reveal>
        </div>
      </PageContainer>
    </>
  );
}
