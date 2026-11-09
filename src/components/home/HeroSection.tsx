import Link from "next/link";
import { btnBase, btnPrimary } from "@/components/ui/buttons";

// Màn hình đầu tiên, ngay dưới banner: tiêu đề, một câu giới thiệu và nút xem sản phẩm. Căn giữa, gọn.
export default function HeroSection() {
  return (
    <section id="top" aria-labelledby="hero-title" className="pb-12 pt-12 lg:pb-16 lg:pt-16">
      <div className="mx-auto w-full max-w-container px-4 text-center md:px-6 lg:px-8">
        <h1
          id="hero-title"
          className="font-display text-[3rem] font-bold leading-[1.08] tracking-[-0.01em] text-ink sm:text-[4.25rem] xl:text-[5rem]"
        >
          Quà quê, từ Bắc vào Nam
        </h1>
        <p className="mx-auto mt-6 max-w-[40rem] text-lg text-ink-muted">
          Mỗi món ở Đặc sản 3 Miền ghi rõ nơi làm ra, từ đồi chè Tân Cương đến nhà thùng nước mắm Phú Quốc.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/san-pham" className={`${btnBase} ${btnPrimary}`}>
            Xem tất cả sản phẩm
          </Link>
        </div>
      </div>
    </section>
  );
}
