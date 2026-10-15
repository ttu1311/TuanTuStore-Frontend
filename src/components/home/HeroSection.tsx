import Link from "next/link";
import ProductRoute from "@/components/home/ProductRoute";
import { btnBase, btnPrimary, btnSecondary } from "@/components/ui/buttons";

// The first screen: the headline stays in place on large screens while the route "Bắc vào Nam" runs beside it.
export default function HeroSection() {
  return (
    <section id="top" aria-labelledby="hero-title" className="pb-16 pt-10 lg:pb-24 lg:pt-16">
      <div className="mx-auto grid w-full max-w-container gap-12 px-4 md:px-6 lg:grid-cols-[5fr_6fr] lg:gap-20 lg:px-8">
        <div className="lg:sticky lg:top-44 lg:self-start">
          <h1
            id="hero-title"
            className="font-display text-[3.75rem] font-bold leading-[0.92] tracking-[-0.01em] text-ink sm:text-[5rem] xl:text-hero"
          >
            Quà quê,
            <br />
            từ Bắc
            <br />
            vào Nam
          </h1>
          <p className="mt-8 max-w-[34rem] text-lg text-ink-muted">
            Mỗi món ở TuanTuStore ghi rõ nơi làm ra, từ đồi chè Tân Cương đến nhà thùng nước mắm Phú Quốc. Chọn một điểm
            trên đường để xem đặc sản của vùng đó.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/san-pham" className={`${btnBase} ${btnPrimary}`}>
              Xem tất cả sản phẩm
            </Link>
            <a href="#ba-mien" className={`${btnBase} ${btnSecondary}`}>
              Chọn theo vùng miền
            </a>
          </div>
        </div>

        <ProductRoute />
      </div>
    </section>
  );
}
