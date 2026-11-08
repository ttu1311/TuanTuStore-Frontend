import Link from "next/link";
import { btnBase, btnSecondary } from "@/components/ui/buttons";
import { storeContact } from "@/data/contact";

// "Giới thiệu" ngắn ở cuối trang chủ (mục menu "Giới thiệu" mở tới đây)
export default function AboutSection() {
  return (
    <section
      id="gioi-thieu"
      aria-labelledby="about-title"
      className="grid gap-6 rounded-lg bg-surface p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-10"
    >
      <div>
        <h2 id="about-title" className="font-display text-3xl/[1.1] font-bold text-ink md:text-4xl/[1.1]">
          Về Đặc sản 3 Miền
        </h2>
        <p className="mt-4 max-w-[46rem] text-lg text-ink-muted">
          Đặc sản 3 Miền gom quà quê của các tỉnh từ Bắc vào Nam về một nơi. Mỗi món ghi rõ tỉnh làm ra và thương hiệu thật,
          để bạn biết mình đang mua gì, và tặng người thân món quà đúng vị quê.
        </p>
        <p className="mt-3 text-ink-muted">
          Cần tư vấn chọn quà? Gọi hoặc nhắn Zalo{" "}
          <a href={`tel:${storeContact.phone}`} className="font-semibold text-primary underline underline-offset-4">
            {storeContact.phoneDisplay}
          </a>
          .
        </p>
      </div>
      <div className="flex flex-wrap gap-3 md:flex-col">
        <Link href="/lien-he" className={`${btnBase} ${btnSecondary}`}>
          Liên hệ cửa hàng
        </Link>
        <Link href="/ban-do" className={`${btnBase} ${btnSecondary}`}>
          Xem bản đồ đặc sản
        </Link>
      </div>
    </section>
  );
}
