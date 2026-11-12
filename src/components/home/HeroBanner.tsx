"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { btnBase, btnLight } from "@/components/ui/buttons";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { DISCOUNT, FREE_SHIPPING_MIN } from "@/lib/cart";
import { formatVND } from "@/lib/format";

// Ba slide hướng khách tới việc mua hàng (ảnh nền là ba ảnh ba miền). Mức miễn phí vận chuyển và giảm giá lấy từ src/lib/cart.ts.
const slides: { key: string; image: string; alt: string; kicker: string; title: string; text: string; tab: string; cta: string; href: string }[] = [
  {
    key: "chon-qua",
    image: "/images/region-bac.jpg",
    alt: "Đồi chè xanh mướt ở Thái Nguyên",
    kicker: "Đặc sản ba miền",
    title: "Quà quê, từ Bắc vào Nam",
    text: "Từ đồi chè Tân Cương đến nhà thùng nước mắm Phú Quốc: món nào cũng ghi rõ nơi làm ra.",
    tab: "Chọn quà",
    cta: "Chọn quà ngay",
    href: "#san-pham",
  },
  {
    key: "hop-qua",
    image: "/images/region-trung.jpg",
    alt: "Thuyền gỗ trên sông Thu Bồn, phố cổ Hội An",
    kicker: "Quà tặng",
    title: "Ghép hộp quà ba miền",
    text: "Mỗi miền một món, gói chung một hộp kèm thiệp, miễn phí gói quà.",
    tab: "Hộp quà",
    cta: "Ghép hộp quà",
    href: "/hop-qua",
  },
  {
    key: "uu-dai",
    image: "/images/region-nam.jpg",
    alt: "Thuyền chở dưa hấu ở chợ nổi Cần Thơ, đồng bằng sông Cửu Long",
    kicker: "Ưu đãi",
    title: `Miễn phí vận chuyển từ ${formatVND(FREE_SHIPPING_MIN)}`,
    text: `Mỗi đơn hàng còn được giảm ${formatVND(DISCOUNT)}.`,
    tab: "Ưu đãi",
    cta: "Mua sắm ngay",
    href: "/san-pham",
  },
];

// Banner động đầu trang chủ: ba ảnh thay nhau hiện ra (mờ dần, ảnh phóng to rất chậm).
// Mỗi ảnh ở lại 6 giây (animate-progress trong tailwind.config.ts); thanh tiến trình dưới tên slide chạy hết thì sang ảnh kế tiếp.
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
      {/* Tiêu đề trang (chỉ cho trình đọc màn hình và công cụ tìm kiếm); chữ lớn nằm ở slide đầu */}
      <h1 className="sr-only">Đặc sản 3 Miền: quà quê từ Bắc vào Nam</h1>
      <div
        className="relative h-[440px] overflow-hidden rounded-2xl bg-primary-dark sm:h-[400px] lg:h-[400px]"
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
                // Lớp phủ đỏ rượu đậm (màu của logo) chỉ ở phía có chữ (dưới trên điện thoại, trái trên màn hình lớn); phần còn lại để ảnh sáng tự nhiên
                className="absolute inset-0 bg-gradient-to-t from-[#2b050c]/75 via-[#2b050c]/20 to-transparent lg:bg-gradient-to-r lg:from-[#2b050c]/70 lg:via-[#2b050c]/25 lg:to-transparent"
              />

              {/* key: chữ của ảnh mới chạy lại hiệu ứng hiện lên */}
              {isActive && (
                <div
                  key={active}
                  className="absolute inset-x-0 bottom-0 p-6 pb-20 text-white [text-shadow:0_1px_14px_rgb(0_0_0/0.45)] sm:p-10 sm:pb-20 lg:bottom-auto lg:top-[44%] lg:max-w-[40rem] lg:-translate-y-1/2 lg:p-12 lg:pb-12"
                >
                  {/* Nhãn kem có biểu tượng logo: chữ đỏ rượu đọc rõ trên mọi ảnh (tương phản 10:1) */}
                  <p className="inline-flex animate-fade-up items-center gap-2 rounded-full bg-[#FFF8EC] py-1.5 pl-2.5 pr-4 text-xs font-bold uppercase tracking-[0.16em] text-[#830E20] [text-shadow:none] sm:text-sm">
                    <Image src="/brand/mark.webp" alt="" width={291} height={360} sizes="24px" className="h-6 w-auto" />
                    {slide.kicker}
                  </p>
                  <h2 className="mt-3 animate-fade-up text-balance font-display text-4xl/[1.08] font-bold [animation-delay:120ms] sm:text-5xl/[1.08] lg:text-6xl/[1.08]">
                    {slide.title}
                  </h2>
                  <p className="mt-3 max-w-[30rem] animate-fade-up text-base text-white/85 [animation-delay:240ms] sm:text-lg">
                    {slide.text}
                  </p>
                  {slide.href.startsWith("#") ? (
                    // Cuộn tới một khối của CHÍNH trang này. Tự cuộn (không đổi địa chỉ), vì liên kết "#…" chỉ cuộn được MỘT lần:
                    // địa chỉ đã có "#san-pham" thì bấm lần nữa không làm gì.
                    <a
                      href={slide.href}
                      onClick={(event) => {
                        event.preventDefault();
                        document.getElementById(slide.href.slice(1))?.scrollIntoView({ block: "start" });
                      }}
                      className={`${btnBase} ${btnLight} mt-5 animate-fade-up [animation-delay:360ms]`}
                    >
                      {slide.cta}
                      <Icon name="arrow" size={18} />
                    </a>
                  ) : (
                    <Link href={slide.href} className={`${btnBase} ${btnLight} mt-5 animate-fade-up [animation-delay:360ms]`}>
                      {slide.cta}
                      <Icon name="arrow" size={18} />
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Điều khiển: tên ba slide kèm thanh tiến trình, nút trước/sau và tạm dừng */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 sm:p-6 lg:px-14">
          <div className="flex flex-1 gap-3 sm:max-w-[26rem]">
            {slides.map((slide, index) => {
              const isActive = index === active;
              return (
                <button
                  key={slide.key}
                  type="button"
                  onClick={() => go(index)}
                  aria-label={`Xem slide: ${slide.tab}`}
                  aria-current={isActive ? "true" : undefined}
                  className="group flex min-h-11 flex-1 flex-col justify-end gap-2 text-left"
                >
                  <span
                    className={`hidden text-xs font-semibold uppercase tracking-wider transition-colors duration-200 [text-shadow:0_1px_8px_rgb(0_0_0/0.55)] sm:block ${
                      isActive ? "text-white" : "text-white/85 group-hover:text-white"
                    }`}
                  >
                    {slide.tab}
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
