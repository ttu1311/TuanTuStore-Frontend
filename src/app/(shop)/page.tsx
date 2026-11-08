import AboutSection from "@/components/home/AboutSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import HeroBanner from "@/components/home/HeroBanner";
import HeroSection from "@/components/home/HeroSection";
import RegionSection from "@/components/home/RegionSection";
import { PageContainer } from "@/components/layout/PageLayout";
import Reveal from "@/components/ui/Reveal";

// Trang chủ, gọn còn các khối chính:
// banner ba miền → giới thiệu + tuyến "Bắc vào Nam" theo tỉnh → sản phẩm nổi bật → ba miền → giới thiệu ngắn.
// Bản đồ có trang riêng (/ban-do); hộp quà, dịp tặng, sản phẩm… vẫn có trang của chúng.
// "Sản phẩm nổi bật" và tuyến "Bắc vào Nam" đọc sản phẩm từ localStorage ở trình duyệt.
export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <HeroSection />
      <PageContainer className="pb-16 pt-4 lg:pb-24 lg:pt-8">
        <div className="space-y-16 lg:space-y-20">
          <Reveal>
            <FeaturedProducts />
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
