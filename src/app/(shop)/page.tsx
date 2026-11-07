import HeroBanner from "@/components/home/HeroBanner";
import HeroSection from "@/components/home/HeroSection";
import PlaceMarquee from "@/components/home/PlaceMarquee";
import RegionSection from "@/components/home/RegionSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import BestSellerSection from "@/components/home/BestSellerSection";
import NewArrivals from "@/components/home/NewArrivals";
import PromoBanner from "@/components/home/PromoBanner";
import RecentSection from "@/components/home/RecentSection";
import TrustSection from "@/components/home/TrustSection";
import VietnamMapSection from "@/components/home/VietnamMapSection";
import ContentSidebar, { PageContainer } from "@/components/layout/PageLayout";
import Reveal from "@/components/ui/Reveal";

// Trang chủ. Trên cùng là banner động ba miền, rồi Hero (tiêu đề + tuyến "Bắc vào Nam") và dải tên các nơi làm ra đặc sản chạy ngang.
// Bên dưới, trang chia đôi: Nội dung bên trái, Sidebar (bán chạy, mới về, bản đồ ba miền, đã xem gần đây, vì sao chọn chúng tôi) bên phải.
// Các phần tĩnh được render trên server;
// "Sản phẩm nổi bật" và "Đặc sản bán chạy" đọc sản phẩm từ localStorage ở trình duyệt.
export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <HeroSection />
      <PlaceMarquee />
      <PageContainer className="pb-16 pt-4 lg:pb-24 lg:pt-8">
        <ContentSidebar
          sidebarLabel="Đặc sản bán chạy, mới về và thông tin cửa hàng"
          sidebar={
            <div className="space-y-6">
              <Reveal>
                <BestSellerSection />
              </Reveal>
              <Reveal delay={100}>
                <NewArrivals />
              </Reveal>
              <Reveal delay={150}>
                <VietnamMapSection />
              </Reveal>
              <RecentSection />
              <Reveal>
                <TrustSection />
              </Reveal>
            </div>
          }
        >
          <div className="space-y-16 lg:space-y-20">
            <Reveal>
              <FeaturedProducts />
            </Reveal>
            <Reveal>
              <RegionSection />
            </Reveal>
            <Reveal>
              <PromoBanner />
            </Reveal>
          </div>
        </ContentSidebar>
      </PageContainer>
    </>
  );
}
