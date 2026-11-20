import Link from "next/link";
import { btnBase, btnLight } from "@/components/ui/buttons";
import { storeContact } from "@/data/contact";

// "Giới thiệu" ngắn ở cuối trang chủ (mục menu "Giới thiệu" mở tới đây)
export default function AboutSection() {
  return (
    <section
      id="gioi-thieu"
      aria-labelledby="about-title"
      className="relative grid gap-6 overflow-clip rounded-2xl bg-gradient-to-br from-primary-dark to-primary p-6 text-white [&_a:focus-visible]:outline-white md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-10"
    >
      {/* Vòng trang trí vàng ở góc (không mang nội dung) */}
      <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border-[18px] border-gold-light/25" />
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-20 right-1/3 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
      <div className="relative">
        <h2 id="about-title" className="font-display text-3xl/[1.1] font-bold md:text-4xl/[1.1]">
          Về Đặc sản 3 Miền
        </h2>
        <p className="mt-4 max-w-[46rem] text-lg text-white/90">
          Đặc sản 3 Miền gom quà quê của các tỉnh từ Bắc vào Nam về một nơi. Mỗi món ghi rõ tỉnh làm ra và thương hiệu thật,
          để bạn biết mình đang mua gì, và tặng người thân món quà đúng vị quê.
        </p>
        <p className="mt-3 text-white/90">
          Cần tư vấn chọn quà? Gọi hoặc nhắn Zalo{" "}
          <a href={`tel:${storeContact.phone}`} className="font-semibold text-gold-light underline underline-offset-4 hover:text-white">
            {storeContact.phoneDisplay}
          </a>
          .
        </p>
      </div>
      <div className="relative flex flex-wrap gap-3 md:flex-col">
        <Link href="/lien-he" className={`${btnBase} ${btnLight}`}>
          Liên hệ cửa hàng
        </Link>
      </div>
    </section>
  );
}
