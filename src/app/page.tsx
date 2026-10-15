import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import RegionSection from "@/components/home/RegionSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import BestSellerSection from "@/components/home/BestSellerSection";
import PromoBanner from "@/components/home/PromoBanner";
import TrustSection from "@/components/home/TrustSection";

// Homepage. The static sections are rendered on the server;
// "Sản phẩm nổi bật" and "Đặc sản bán chạy" read the products from localStorage in the browser.
export default function HomePage() {
  return (
    <>
      <Header />
      <main id="main-content">
        <HeroSection />
        <RegionSection />
        <FeaturedProducts />
        <BestSellerSection />
        <PromoBanner />
        <TrustSection />
      </main>
      <Footer />
    </>
  );
}
