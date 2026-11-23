"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import DealCard from "@/components/home/DealCard";
import Icon from "@/components/ui/Icon";
import { useStore } from "@/context/StoreContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { discountPercent } from "@/lib/products";

const MAX_DEALS = 5; // một hàng 5 món, hiện 4 món cùng lúc (máy tính), món còn lại xem bằng mũi tên

// Chiều rộng của mỗi ô trong MỘT hàng cuộn ngang (khoảng cách gap-3 trên điện thoại, gap-5 từ 640px):
// điện thoại ~72% bề ngang (lộ một phần thẻ kế tiếp để gợi ý vuốt), từ 640px hiện 2 thẻ, từ 1024px hiện 4 thẻ.
const cellClass = "w-[72%] shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-3.75rem)/4)]";

// "Ưu đãi hôm nay" ở trang chủ, ngay dưới banner: mọi sản phẩm đang giảm giá, tức là có "Giá cũ" lớn hơn giá hiện tại
// (Admin nhập "Giá cũ" ở form sản phẩm là món đó tự vào đây, xóa "Giá cũ" là món đó tự ra). Giảm nhiều nhất xếp trước,
// bằng nhau thì giá thấp trước. Món hết hàng không đưa vào. Không món nào giảm giá thì cả khối biến mất.
// Một hàng duy nhất tối đa 5 món: nhiều hơn số thẻ hiện được thì có hai mũi tên ở hai bên (từ 640px), mỗi lần bấm sang một thẻ;
// trên điện thoại vuốt ngang. Thẻ hiện lần lượt (mỗi thẻ trễ hơn thẻ trước 60ms) khi khối được cuộn tới.
export default function TodayDeals() {
  const { isReady, products } = useStore();
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [canPrev, setCanPrev] = useState(false); // còn món bên trái chưa thấy
  const [canNext, setCanNext] = useState(false); // còn món bên phải chưa thấy

  const allDeals = products
    .filter((product) => discountPercent(product) > 0 && product.stock > 0)
    .sort((a, b) => discountPercent(b) - discountPercent(a) || a.price - b.price);
  const deals = allDeals.slice(0, MAX_DEALS);

  // Đã đọc xong dữ liệu mà không có món nào giảm giá: không hiện gì (không chừa khoảng trống)
  const hasSection = !isReady || deals.length > 0;

  // Hiện thẻ khi khối lọt vào màn hình, MỘT lần (giống Reveal)
  useEffect(() => {
    const element = sectionRef.current;
    if (!hasSection || !element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasSection]);

  // Theo dõi vị trí cuộn và bề rộng để biết mũi tên nào còn bấm được (hàng vừa khít thì không có mũi tên nào)
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!hasSection || !scroller) return;
    const update = () => {
      setCanPrev(scroller.scrollLeft > 1);
      setCanNext(scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 1);
    };
    const resizeObserver = new ResizeObserver(update); // chạy ngay một lần khi bắt đầu theo dõi
    resizeObserver.observe(scroller);
    scroller.addEventListener("scroll", update, { passive: true });
    return () => {
      resizeObserver.disconnect();
      scroller.removeEventListener("scroll", update);
    };
  }, [hasSection, isReady, deals.length]);

  // Sang trái / phải đúng một thẻ (chiều rộng một thẻ cộng khoảng cách giữa các thẻ)
  function slide(direction: 1 | -1) {
    const scroller = scrollerRef.current;
    const card = scroller?.querySelector("li");
    if (!scroller || !card?.parentElement) return;
    const gap = parseFloat(getComputedStyle(card.parentElement).columnGap) || 0;
    scroller.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: reducedMotion ? "auto" : "smooth" });
  }

  if (!hasSection) return null;

  // Lớp ngoài của mỗi thẻ làm hiệu ứng hiện lên; hiệu ứng nhấc lên khi rê chuột nằm ở thẻ bên trong (DealCard),
  // vì animation giữ nguyên vị trí cuối sẽ chặn mọi transform đặt trên cùng phần tử.
  const enter = (index: number) => ({
    className: shown ? "animate-fade-up" : "opacity-0",
    style: { animationDelay: `${index * 60}ms` },
  });

  return (
    <section
      ref={sectionRef}
      id="uu-dai-hom-nay"
      aria-labelledby="deals-title"
      className="relative overflow-clip rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6 lg:p-8"
    >
      {/* Điểm nhấn: dải màu mảnh ở mép trên và một vệt sáng mờ ở góc (trang trí, không mang nội dung) */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-gold to-primary/10" />
      <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 sm:mb-8">
        <div>
          <p className="mb-3 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            <span className="h-0.5 w-10 rounded-full bg-primary" aria-hidden="true" />
            Giá tốt
          </p>
          <h2 id="deals-title" className="font-display text-3xl/[1.2] font-bold text-ink sm:text-4xl/[1.2]">
            Ưu đãi hôm nay
          </h2>
          <p className="mt-2 max-w-[32rem] text-ink-muted">Các món giảm giá duy nhất trong hôm nay.</p>
        </div>
        {isReady && (
          <div className="flex items-center gap-4">
            <p className="rounded-full bg-primary-soft px-3.5 py-1.5 text-sm font-semibold text-primary">{allDeals.length} món đang giảm</p>
            {/* Trang /san-pham chưa có bộ lọc hay sắp xếp theo giảm giá, nên liên kết tới danh sách đầy đủ */}
            <Link href="/san-pham" className="inline-flex min-h-11 items-center gap-1 font-semibold text-primary hover:underline">
              Xem tất cả
              <Icon name="arrow" size={16} />
            </Link>
          </div>
        )}
      </div>

      {/* Một hàng cuộn ngang có scroll-snap. Hai mũi tên nằm ở hai mép hàng (từ 640px); điện thoại thì vuốt.
          Vùng cuộn có đệm trên / dưới / hai bên (kéo lại bằng lề âm) để bóng và hiệu ứng nhấc lên của thẻ không bị cắt. */}
      <div className="relative">
        <div
          ref={scrollerRef}
          role="region"
          tabIndex={0}
          aria-label="Danh sách món đang giảm giá"
          className="relative -mx-4 -mb-8 -mt-3 snap-x snap-mandatory overflow-x-auto scroll-px-4 pb-8 pt-3 [scrollbar-width:none] sm:-mx-2 sm:scroll-px-2 sm:px-2 [&::-webkit-scrollbar]:hidden"
        >
          <ul className="flex gap-3 px-4 sm:gap-5 sm:px-0">
            {isReady
              ? deals.map((product, index) => {
                  const effect = enter(index);
                  return (
                    <li key={product.id} className={`${cellClass} ${effect.className}`} style={effect.style}>
                      <DealCard product={product} />
                    </li>
                  );
                })
              : [1, 2, 3, 4].map((n) => (
                  <li key={n} className={cellClass} aria-hidden="true">
                    <DealCardSkeleton />
                  </li>
                ))}
          </ul>
        </div>

        {(canPrev || canNext) && (
          <>
            <button type="button" onClick={() => slide(-1)} disabled={!canPrev} aria-label="Xem món giảm giá trước" className={`${arrowButton} left-0 -translate-x-1/2`}>
              <Icon name="chevron-left" size={22} />
            </button>
            <button type="button" onClick={() => slide(1)} disabled={!canNext} aria-label="Xem món giảm giá kế tiếp" className={`${arrowButton} right-0 translate-x-1/2`}>
              <Icon name="chevron-right" size={22} />
            </button>
          </>
        )}
      </div>
    </section>
  );
}

// Mũi tên ở mép hàng, ngang tầm ảnh sản phẩm. Hết món ở phía đó thì mờ đi và không bấm được.
const arrowButton =
  "absolute top-[30%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-ink shadow-card transition-colors duration-200 enabled:hover:bg-primary enabled:hover:text-white disabled:cursor-default disabled:opacity-30 sm:inline-flex";

// Khung xám giữ chỗ có kích thước gần bằng DealCard, hiển thị trong lúc sản phẩm tải từ localStorage
function DealCardSkeleton() {
  return (
    <div className="rounded-xl border border-line bg-white p-3">
      <div className="aspect-square w-full animate-pulse rounded-lg bg-surface" />
      <div className="space-y-3 pt-3">
        <div className="h-3 w-1/2 rounded bg-surface" />
        <div className="h-10 w-full rounded bg-surface" />
        <div className="h-6 w-2/3 rounded bg-surface" />
        <div className="h-5 w-1/2 rounded-full bg-surface" />
        <div className="h-12 w-full rounded-md bg-surface" />
      </div>
    </div>
  );
}
