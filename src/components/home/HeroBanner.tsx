"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { btnBase, btnPrimary } from "@/components/ui/buttons";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Slide = {
  key: string;
  image: string;
  alt: string;
  kicker: string; // nhãn nhỏ phía trên
  title: string; // dòng chữ lớn
  accent: string; // dòng chữ nghiêng bên dưới
  accentClass: string; // màu của dòng chữ nghiêng
  tab: string; // tên slide (đọc cho người dùng trình đọc màn hình)
  cta: string;
  href: string;
};

// Bốn ảnh mâm đặc sản trên nền sáng (public/images/banner). Món ăn nằm bên phải ảnh, bên trái là mặt bàn / khăn trống
// nên chữ đặt bên trái. Ít chữ: một nhãn nhỏ, một tiêu đề hai dòng và một nút.
const slides: Slide[] = [
  {
    key: "ba-mien",
    image: "/images/banner/banner-sang-ba-mien.webp",
    alt: "Mâm đặc sản trên bàn gỗ sáng: mực xào, bánh chiên, cốm xanh, bánh bột lọc và bánh pía",
    kicker: "Đặc sản ba miền",
    title: "Quà quê",
    accent: "từ Bắc vào Nam",
    accentClass: "text-primary",
    tab: "Ba miền",
    cta: "Mua sắm ngay",
    href: "/san-pham",
  },
  {
    key: "mien-bac",
    image: "/images/banner/banner-sang-mien-bac.webp",
    alt: "Thịt khô xé sợi, bánh chiên giòn và cốm xanh trên khay tre",
    kicker: "Miền Bắc",
    title: "Hương vị",
    accent: "miền Bắc",
    accentClass: "text-che",
    tab: "Miền Bắc",
    cta: "Xem đặc sản Miền Bắc",
    href: "/san-pham?region=bac",
  },
  {
    key: "mien-trung",
    image: "/images/banner/banner-sang-mien-trung.webp",
    alt: "Mực nướng mật ong rắc mè và bánh bột lọc trên lá chuối",
    kicker: "Miền Trung",
    title: "Đậm đà",
    accent: "miền Trung",
    accentClass: "text-primary",
    tab: "Miền Trung",
    cta: "Xem đặc sản Miền Trung",
    href: "/san-pham?region=trung",
  },
  {
    key: "mien-nam",
    image: "/images/banner/banner-sang-mien-nam.webp",
    alt: "Bánh pía nhân trứng muối, lạp xưởng nướng và tôm khô",
    kicker: "Miền Nam",
    title: "Vị ngọt",
    accent: "miền Tây",
    accentClass: "text-gold-ink",
    tab: "Miền Nam",
    cta: "Xem đặc sản Miền Nam",
    href: "/san-pham?region=nam",
  },
];

// Banner động đầu trang chủ: các ảnh nền sáng thay nhau hiện ra (mờ dần, ảnh phóng to rất chậm).
// Mỗi ảnh ở lại 3 giây (animate-progress trong tailwind.config.ts); chấm tròn của ảnh đang xem dài ra thành thanh tiến trình,
// chạy hết thì sang ảnh kế tiếp. Tạm dừng khi rê chuột / đưa bàn phím vào banner, hoặc bằng nút tạm dừng.
// Người bật "giảm chuyển động" thì banner không tự chuyển, chỉ đổi khi bấm.
export default function HeroBanner() {
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [stopped, setStopped] = useState(false); // nút tạm dừng
  const autoplay = !reducedMotion && !stopped;
  const paused = hovered || stopped;

  const go = (index: number) => setActive((index + slides.length) % slides.length);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Đặc sản ba miền"
      className="mx-auto w-full max-w-container px-4 pt-6 md:px-6 lg:px-8"
    >
      {/* Tiêu đề trang (chỉ cho trình đọc màn hình và công cụ tìm kiếm); chữ lớn nằm ở slide đầu */}
      <h1 className="sr-only">Đặc sản 3 Miền: quà quê từ Bắc vào Nam</h1>
      <div
        // overflow-clip (không phải overflow-hidden): khung không bao giờ bị cuộn ngang khi bấm nút hoặc đưa bàn phím vào
        className="relative h-[460px] overflow-clip rounded-2xl border border-line bg-surface shadow-card sm:h-[440px] lg:h-[500px]"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setHovered(false);
        }}
      >
        {slides.map((slide, index) => {
          const isActive = index === active;
          return (
            <div
              key={slide.key}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} / ${slides.length}: ${slide.tab}`}
              inert={!isActive}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${isActive ? "opacity-100" : "opacity-0"}`}
            >
              {/* Ảnh đang hiện phóng to rất chậm; ảnh vừa rời đi thu lại cũng chậm, nên không bị giật.
                  Trên điện thoại khung hẹp nên lấy phần bên phải của ảnh (nơi có món ăn). */}
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                preload={index === 0}
                sizes="(min-width: 1280px) 1216px, 100vw"
                className={`object-cover object-[75%_center] transition-transform duration-[4000ms] ease-linear lg:object-center ${
                  isActive ? "scale-105" : "scale-100"
                }`}
              />
              {/* Lớp sáng mờ dần phía có chữ (dưới trên điện thoại, trái trên màn hình lớn) để chữ tối luôn đọc rõ trên mọi ảnh */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/65 to-white/0 sm:bg-gradient-to-r sm:from-white/75 sm:via-white/35 sm:to-white/0"
              />

              {/* key: chữ của ảnh mới chạy lại hiệu ứng hiện lên */}
              {isActive && (
                <div
                  key={active}
                  className="absolute inset-x-0 bottom-0 p-6 pb-16 text-ink sm:inset-y-0 sm:right-auto sm:flex sm:w-[60%] sm:flex-col sm:justify-center sm:p-10 lg:w-[46%] lg:p-14"
                >
                  <p className="inline-flex w-fit animate-fade-up items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] text-gold-ink sm:text-sm">
                    <span className="h-0.5 w-8 rounded-full bg-gold" aria-hidden="true" />
                    {slide.kicker}
                  </p>
                  <h2 className="mt-3 animate-fade-up font-display text-4xl/[1.12] font-bold text-ink [animation-delay:120ms] sm:text-5xl/[1.12] lg:text-6xl/[1.1]">
                    {slide.title}
                    <span
                      className={`mt-1 block font-[family-name:var(--font-brand)] text-3xl/[1.2] font-semibold italic normal-case lg:text-4xl/[1.2] ${slide.accentClass}`}
                    >
                      {slide.accent}
                    </span>
                  </h2>
                  <Link href={slide.href} className={`${btnBase} ${btnPrimary} mt-6 w-fit animate-fade-up shadow-md [animation-delay:260ms]`}>
                    {slide.cta}
                    <Icon name="arrow" size={18} />
                  </Link>
                </div>
              )}
            </div>
          );
        })}

        {/* Mũi tên trước / sau ở hai mép banner (từ cỡ màn hình nhỏ trở lên) */}
        <button type="button" onClick={() => go(active - 1)} aria-label="Ảnh trước" className={`${arrowButton} left-3`}>
          <Icon name="chevron-left" size={22} />
        </button>
        <button type="button" onClick={() => go(active + 1)} aria-label="Ảnh sau" className={`${arrowButton} right-3`}>
          <Icon name="chevron-right" size={22} />
        </button>

        {/* Chấm tròn ở giữa phía dưới: chấm của ảnh đang xem dài ra và chạy như thanh tiến trình, chạy hết thì sang ảnh kế tiếp */}
        <div className="absolute inset-x-0 bottom-1 flex items-center justify-center">
          {slides.map((slide, index) => {
            const isActive = index === active;
            return (
              <button
                key={slide.key}
                type="button"
                onClick={() => go(index)}
                aria-label={`Xem ảnh: ${slide.tab}`}
                aria-current={isActive ? "true" : undefined}
                className="group flex h-11 items-center px-1.5"
              >
                <span
                  className={`block h-1.5 overflow-hidden rounded-full bg-ink/25 transition-all duration-300 ${
                    isActive ? "w-10" : "w-1.5 group-hover:bg-ink/50"
                  }`}
                >
                  {isActive &&
                    (autoplay ? (
                      // Thanh chạy hết thì sang ảnh kế tiếp. key: chạy lại từ đầu mỗi khi đổi ảnh.
                      <span
                        key={active}
                        onAnimationEnd={() => go(active + 1)}
                        className="block h-full origin-left animate-progress rounded-full bg-primary"
                        style={{ animationPlayState: paused ? "paused" : "running" }}
                      />
                    ) : (
                      <span className="block h-full rounded-full bg-primary" />
                    ))}
                </span>
              </button>
            );
          })}
        </div>

        {/* Nút tạm dừng tự chuyển ảnh (góc dưới bên phải) */}
        {!reducedMotion && (
          <button
            type="button"
            onClick={() => setStopped(!stopped)}
            aria-label={stopped ? "Tiếp tục tự chuyển ảnh" : "Tạm dừng tự chuyển ảnh"}
            className="absolute bottom-1 right-3 inline-flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors duration-200 hover:bg-white hover:text-primary"
          >
            <Icon name={stopped ? "play" : "pause"} size={18} />
          </button>
        )}
      </div>
    </section>
  );
}

const arrowButton =
  "absolute top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white/85 text-ink shadow-card backdrop-blur-sm transition-colors duration-200 hover:bg-primary hover:text-white sm:inline-flex";
