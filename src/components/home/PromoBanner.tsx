import Image from "next/image";
import { btnBase, btnLight } from "@/components/ui/buttons";

export default function PromoBanner() {
  return (
    <section aria-labelledby="promo-title">
      <div className="grid items-stretch overflow-hidden rounded-lg bg-primary text-white md:grid-cols-2">
        <div className="flex flex-col justify-center gap-6 p-8 sm:p-10">
          <h2 id="promo-title" className="font-display text-4xl font-bold leading-[1.05] xl:text-5xl">
            Gom quà ba miền vào một giỏ
          </h2>
          <p className="max-w-[30rem] text-lg text-footer-text">
            Chè miền Bắc, cà phê miền Trung, kẹo dừa miền Nam: chọn món từ mỗi miền và đặt chung một đơn hàng.
          </p>
          <a href="#ba-mien" className={`${btnBase} ${btnLight} self-start`}>
            Chọn quà theo vùng miền
          </a>
        </div>
        <div className="bg-primary-dark">
          <Image
            src="/images/promo.jpg"
            width={1920}
            height={1446}
            sizes="(min-width: 1280px) 440px, (min-width: 768px) 40vw, 100vw"
            alt="Chiếc bánh chưng gói lá dong buộc lạt tre trên đĩa trắng"
            className="block aspect-[1920/1446] h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
