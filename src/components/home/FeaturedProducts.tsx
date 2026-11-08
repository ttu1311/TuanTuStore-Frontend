"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import Icon from "@/components/ui/Icon";
import SectionHeader from "@/components/ui/SectionHeader";
import { btnBase, btnGhost } from "@/components/ui/buttons";
import { useStore } from "@/context/StoreContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { getFeaturedProducts } from "@/lib/products";
import { soldCounts } from "@/lib/reviews";

const AUTO_SCROLL_MS = 5000;
// 1 thẻ (điện thoại, ló một phần thẻ sau), 2 thẻ, 3 thẻ từ cỡ lg, rồi 4 thẻ từ cỡ xl (băng rộng hết trang). Khoảng cách 24px.
const slideClass =
  "flex w-[85%] shrink-0 snap-start min-[480px]:w-[calc((100%-24px)/2)] lg:w-[calc((100%-48px)/3)] xl:w-[calc((100%-72px)/4)]";

// "Sản phẩm nổi bật": 8 món có điểm cao nhất (lượt mua × 5 + lượt xem, xem getFeaturedProducts), trên một băng trượt ngang.
// Băng tự trượt sang thẻ kế tiếp mỗi 5 giây (hết thì quay về đầu), có nút ‹ › và kéo/vuốt được bằng tay.
// Tự trượt dừng khi rê chuột, chạm hoặc đưa bàn phím vào băng, và tắt hẳn với người bật "giảm chuyển động".
export default function FeaturedProducts() {
  const { isReady, products, orders, productViews } = useStore();
  const featured = getFeaturedProducts(products, soldCounts(orders), productViews);
  const reducedMotion = useReducedMotion();
  const trackRef = useRef<HTMLUListElement>(null);
  const [paused, setPaused] = useState(false);

  const step = (direction: 1 | -1) => slideTrack(trackRef.current, direction);
  const canSlide = isReady && featured.length > 1;

  useEffect(() => {
    if (!canSlide || paused || reducedMotion) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) slideTrack(trackRef.current, 1);
    }, AUTO_SCROLL_MS);
    return () => window.clearInterval(timer);
  }, [canSlide, paused, reducedMotion]);

  return (
    <section id="san-pham" aria-labelledby="featured-title" aria-roledescription="carousel">
      <SectionHeader
        id="featured-title"
        title="Sản phẩm nổi bật"
        action={
          <div className="flex items-center gap-2">
            {canSlide && (
              <>
                <button type="button" onClick={() => step(-1)} aria-label="Sản phẩm trước" className={arrowButton}>
                  <Icon name="chevron-left" size={20} />
                </button>
                <button type="button" onClick={() => step(1)} aria-label="Sản phẩm sau" className={arrowButton}>
                  <Icon name="chevron-right" size={20} />
                </button>
              </>
            )}
            <Link href="/san-pham" className={`${btnBase} ${btnGhost}`}>
              Xem tất cả sản phẩm
            </Link>
          </div>
        }
      />
      {isReady && featured.length === 0 ? (
        <p className="text-ink-muted">Chưa có sản phẩm nổi bật.</p>
      ) : (
        // relative: chữ ẩn cho trình đọc màn hình (sr-only, position: absolute) trong thẻ phải nằm trong khung cuộn,
        // nếu không chúng thoát ra ngoài và làm cả trang tràn ngang trên điện thoại
        <ul
          ref={trackRef}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onFocus={() => setPaused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
          }}
          className="relative -mx-1 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {isReady
            ? featured.map((product) => (
                <li key={product.id} className={slideClass}>
                  <ProductCard product={product} />
                </li>
              ))
            : [1, 2, 3].map((n) => (
                <li key={n} className={slideClass}>
                  <ProductCardSkeleton />
                </li>
              ))}
        </ul>
      )}
    </section>
  );
}

// Trượt băng một thẻ sang phải (1) hoặc trái (-1). Ở cuối mà trượt tiếp thì quay về đầu, và ngược lại.
function slideTrack(track: HTMLElement | null, direction: 1 | -1) {
  const card = track?.firstElementChild as HTMLElement | null;
  if (!track || !card) return;
  const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
  const atStart = track.scrollLeft <= 4;
  if (direction === 1 && atEnd) track.scrollTo({ left: 0, behavior: "smooth" });
  else if (direction === -1 && atStart) track.scrollTo({ left: track.scrollWidth, behavior: "smooth" });
  else track.scrollBy({ left: direction * (card.offsetWidth + 24), behavior: "smooth" }); // 24px = gap-6
}

const arrowButton =
  "inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors duration-200 hover:border-primary hover:bg-primary hover:text-white";
