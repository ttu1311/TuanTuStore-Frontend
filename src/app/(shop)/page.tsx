import HeroSection from "@/components/home/HeroSection";
import RegionSection from "@/components/home/RegionSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import BestSellerSection from "@/components/home/BestSellerSection";
import NewArrivals from "@/components/home/NewArrivals";
import PromoBanner from "@/components/home/PromoBanner";
import RecentSection from "@/components/home/RecentSection";
import TrustSection from "@/components/home/TrustSection";
import VietnamMapSection from "@/components/home/VietnamMapSection";
import ContentSidebar, { PageContainer } from "@/components/layout/PageLayout";

// Trang chủ. Hero (tiêu đề + tuyến "Bắc vào Nam") dùng toàn bộ chiều rộng.
// Bên dưới, trang chia đôi: Nội dung bên trái, Sidebar (bán chạy, mới về, bản đồ ba miền, đã xem gần đây, vì sao chọn chúng tôi) bên phải.
// Các phần tĩnh được render trên server;
// "Sản phẩm nổi bật" và "Đặc sản bán chạy" đọc sản phẩm từ localStorage ở trình duyệt.
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PageContainer className="pb-16 pt-4 lg:pb-24 lg:pt-8">
        <ContentSidebar
          sidebarLabel="Đặc sản bán chạy, mới về và thông tin cửa hàng"
          sidebar={
            <div className="space-y-6">
              <BestSellerSection />
              <NewArrivals />
              <VietnamMapSection />
              <RecentSection />
              <TrustSection />
            </div>
          }
        >
          <div className="space-y-16 lg:space-y-20">
            <FeaturedProducts />
            <RegionSection />
            <PromoBanner />
          </div>
        </ContentSidebar>
      </PageContainer>
    </>
  );
}
