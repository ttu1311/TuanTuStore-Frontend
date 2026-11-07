"use client";

import Stars from "@/components/reviews/Stars";
import { useStore } from "@/context/StoreContext";
import { formatRating, ratingSummary, soldCounts } from "@/lib/reviews";

// Một dòng nhỏ "★★★★☆ 4,3 (12) · Đã bán 58" dưới tên sản phẩm (thẻ sản phẩm và trang chi tiết).
// Số liệu thật: đánh giá của khách đã nhận hàng, và số lượng trong các đơn đã đặt. Chưa có gì thì không hiện.
export default function ProductRatingLine({ productId, href }: { productId: string; href?: string }) {
  const { isReady, reviews, orders } = useStore();
  if (!isReady) return null;

  const summary = ratingSummary(reviews.filter((review) => review.productId === productId));
  const sold = soldCounts(orders).get(productId) ?? 0;
  if (summary.count === 0 && sold === 0) return null;

  const rating = summary.count > 0 && (
    <span className="inline-flex items-center gap-1.5">
      <Stars value={summary.average} size={14} />
      <span aria-hidden="true" className="font-medium text-ink">
        {formatRating(summary.average)}
      </span>
      <span aria-hidden="true">({summary.count})</span>
      <span className="sr-only">Điểm trung bình {formatRating(summary.average)} trên 5 sao, {summary.count} đánh giá</span>
    </span>
  );

  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-muted">
      {rating && href ? (
        <a href={href} className="hover:underline">
          {rating}
        </a>
      ) : (
        rating
      )}
      {summary.count > 0 && sold > 0 && <span aria-hidden="true">·</span>}
      {sold > 0 && <span>Đã bán {sold}</span>}
    </p>
  );
}
