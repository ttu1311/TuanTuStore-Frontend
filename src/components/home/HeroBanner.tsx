"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { btnBase, btnLight } from "@/components/ui/buttons";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { regions } from "@/lib/regions";
import type { Region } from "@/types";

const slides: { region: Region; image: string; alt: string; title: string; text: string }[] = [
  {
    region: "bac",
    image: "/images/region-bac.jpg",
    alt: "Đồi chè xanh mướt ở Thái Nguyên",
    title: "Hương chè, vị cốm",
    text: "Chè Tân Cương, ô mai Hàng Đường, bánh cốm Hà Nội: quà của đất Bắc.",
  },
  {
    region: "trung",
    image: "/images/region-trung.jpg",
    alt: "Thuyền gỗ trên sông Thu Bồn, phố cổ Hội An",
    title: "Mè giòn, cà phê đậm",
    text: "Bánh khô mè Cẩm Lệ và cà phê Buôn Ma Thuột, từ dải đất miền Trung.",
  },
  {
    region: "nam",
    image: "/images/region-nam.jpg",
    alt: "Thuyền chở dưa hấu ở chợ nổi Cần Thơ, đồng bằng sông Cửu Long",
    title: "Sông nước tới Đất Mũi",
    text: "Kẹo dừa Bến Tre, nước mắm Phú Quốc và các đặc sản Cà Mau.",
  },
];

// Banner động đầu trang chủ: ba ảnh ba miền thay nhau hiện ra (mờ dần, ảnh phóng to rất chậm).
// Mỗi ảnh ở lại 6 giây (animate-progress trong tailwind.config.ts); thanh tiến trình dưới tên miền chạy hết thì sang ảnh kế tiếp.
// Tạm dừng khi rê chuột / đưa bàn phím vào banner, hoặc bằng nút tạm dừng.
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
      <div
        className="relative h-[420px] overflow-hidden rounded-2xl bg-primary-dark sm:h-[460px] lg:h-[520px]"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setHovered(false);
        }}
      >
        {slides.map((slide, index) => {
          const isActive = index === active;
          const region = regions[slide.region];
          return (
            <div
              key={slide.region}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} / ${slides.length}: ${region.label}`}
              inert={!isActive}
              className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
            >
              {/* Ảnh đang hiện phóng to rất chậm; ảnh vừa rời đi thu lại cũng chậm, nên không bị giật */}
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                preload={index === 0}
                sizes="(min-width: 1280px) 1216px, 100vw"
                className={`object-cover transition-transform duration-[7000ms] ease-linear ${
                  isActive ? "scale-110" : "scale-100"
                }`}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10 lg:bg-gradient-to-r lg:from-black/70 lg:via-black/30 lg:to-transparent"
              />

              {/* key: chữ của ảnh mới chạy lại hiệu ứng hiện lên */}
              {isActive && (
                <div
                  key={active}
                  className="absolute inset-x-0 bottom-0 p-6 pb-20 text-white sm:p-10 sm:pb-24 lg:bottom-auto lg:top-1/2 lg:max-w-[40rem] lg:-translate-y-1/2 lg:p-14"
                >
                  <p className="flex animate-fade-up items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-white/85">
                    <span className={`h-2.5 w-2.5 rounded-full ${region.dotClass} ring-2 ring-white/70`} aria-hidden="true" />
                    {region.label}
                  </p>
                  <h2
                    className="mt-3 animate-fade-up font-display text-5xl/[1.08] font-bold [animation-delay:120ms] sm:text-6xl/[1.08] lg:text-7xl/[1.08]"
                  >
                    {slide.title}
                  </h2>
                  <p className="mt-4 max-w-[30rem] animate-fade-up text-lg text-white/85 [animation-delay:240ms]">
                    {slide.text}
                  </p>
                  <Link
                    href={`/san-pham?region=${slide.region}`}
                    className={`${btnBase} ${btnLight} mt-6 animate-fade-up [animation-delay:360ms]`}
                  >
                    Xem đặc sản {region.label}
                    <Icon name="arrow" size={18} />
                  </Link>
                </div>
              )}
            </div>
          );
        })}

        {/* Điều khiển: tên ba miền kèm thanh tiến trình, nút trước/sau và tạm dừng */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 sm:p-6 lg:px-14">
          <div className="flex flex-1 gap-3 sm:max-w-[26rem]">
            {slides.map((slide, index) => {
              const isActive = index === active;
              return (
                <button
                  key={slide.region}
                  type="button"
                  onClick={() => go(index)}
                  aria-label={`Xem ảnh ${regions[slide.region].label}`}
                  aria-current={isActive ? "true" : undefined}
                  className="group flex min-h-11 flex-1 flex-col justify-end gap-2 text-left"
                >
                  <span
                    className={`hidden text-xs font-semibold uppercase tracking-wider transition-colors duration-200 sm:block ${
                      isActive ? "text-white" : "text-white/60 group-hover:text-white"
                    }`}
                  >
                    {regions[slide.region].label}
                  </span>
                  <span className="block h-1 w-full overflow-hidden rounded-full bg-white/30">
                    {isActive &&
                      (autoplay ? (
                        // Thanh chạy hết thì sang ảnh kế tiếp. key: chạy lại từ đầu mỗi khi đổi ảnh.
                        <span
                          key={active}
                          onAnimationEnd={() => go(active + 1)}
                          className="block h-full origin-left animate-progress rounded-full bg-white"
                          style={{ animationPlayState: paused ? "paused" : "running" }}
                        />
                      ) : (
                        <span className="block h-full rounded-full bg-white" />
                      ))}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex shrink-0 gap-2">
            {!reducedMotion && (
              <button
                type="button"
                onClick={() => setStopped(!stopped)}
                aria-label={stopped ? "Tiếp tục tự chuyển ảnh" : "Tạm dừng tự chuyển ảnh"}
                className={controlButton}
              >
                <Icon name={stopped ? "play" : "pause"} size={18} />
              </button>
            )}
            <button type="button" onClick={() => go(active - 1)} aria-label="Ảnh trước" className={controlButton}>
              <Icon name="chevron-left" size={20} />
            </button>
            <button type="button" onClick={() => go(active + 1)} aria-label="Ảnh sau" className={controlButton}>
              <Icon name="chevron-right" size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

const controlButton =
  "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-black/20 text-white backdrop-blur-sm transition-colors duration-200 hover:bg-white hover:text-primary";
