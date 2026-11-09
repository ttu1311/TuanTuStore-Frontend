import AboutSection from "@/components/home/AboutSection";
import BestSellers from "@/components/home/BestSellers";
import GiftBoxStarter from "@/components/home/GiftBoxStarter";
import HeroBanner from "@/components/home/HeroBanner";
import HeroSection from "@/components/home/HeroSection";
import RegionSection from "@/components/home/RegionSection";
import { PageContainer } from "@/components/layout/PageLayout";
import Reveal from "@/components/ui/Reveal";

// Trang chủ, gọn còn các khối chính:
// banner ba miền → tiêu đề giới thiệu → sản phẩm bán chạy → ghép hộp quà (2 câu hỏi) → ba miền → giới thiệu ngắn.
// Bản đồ có trang riêng (/ban-do); hộp quà, dịp tặng, sản phẩm… vẫn có trang của chúng.
// "Sản phẩm bán chạy" đọc sản phẩm và đơn hàng từ localStorage ở trình duyệt.
export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <HeroSection />
      <PageContainer className="pb-16 pt-4 lg:pb-24 lg:pt-8">
        <div className="space-y-16 lg:space-y-20">
          <Reveal>
            <BestSellers />
          </Reveal>
          <Reveal>
            <GiftBoxStarter />
          </Reveal>
          <Reveal>
            <RegionSection />
          </Reveal>
          <Reveal>
            <AboutSection />
          </Reveal>
        </div>
      </PageContainer>
    </>
  );
}
