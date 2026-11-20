"use client";

import Stars from "@/components/reviews/Stars";
import { useStore } from "@/context/StoreContext";
import { formatRating, ratingSummary, soldCounts } from "@/lib/reviews";

// Một dòng nhỏ "★★★★☆ 4,3 (12) · Đã bán 58" dưới tên sản phẩm (thẻ sản phẩm và trang chi tiết).
// showSold={false}: bỏ phần "Đã bán …" khỏi dòng này (thẻ sản phẩm đặt "Đã bán" ngang hàng với giá bằng ProductSoldCount bên dưới).
// Số liệu thật: đánh giá của khách đã nhận hàng (chỉ người đã mua mới đánh giá được), và số lượng trong các đơn đã đặt.
// Chưa có đánh giá thì vẫn hiện 5 sao rỗng kèm "Chưa có đánh giá", để khách biết sản phẩm có xếp hạng sao.
export default function ProductRatingLine({ productId, href, showSold = true }: { productId: string; href?: string; showSold?: boolean }) {
  const { isReady, reviews, orders } = useStore();
  if (!isReady) return null;

  const summary = ratingSummary(reviews.filter((review) => review.productId === productId));
  const sold = showSold ? (soldCounts(orders).get(productId) ?? 0) : 0;

  const rating =
    summary.count === 0 ? (
      <span className="inline-flex items-center gap-1.5">
        <Stars value={0} size={14} />
        <span>Chưa có đánh giá</span>
      </span>
    ) : (
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
      {href ? (
        <a href={href} className="hover:underline">
          {rating}
        </a>
      ) : (
        rating
      )}
      {sold > 0 && <span aria-hidden="true">·</span>}
      {sold > 0 && <span>Đã bán {sold}</span>}
    </p>
  );
}

// "Đã bán 58": số lượng đã bán của một sản phẩm (tổng số lượng trong các đơn, trừ đơn đã hủy). Chưa bán được thì không hiện gì.
// Thẻ sản phẩm đặt nó cùng hàng với giá.
export function ProductSoldCount({ productId }: { productId: string }) {
  const { isReady, orders } = useStore();
  if (!isReady) return null;
  const sold = soldCounts(orders).get(productId) ?? 0;
  if (sold <= 0) return null;
  return <span className="whitespace-nowrap text-xs text-ink-muted min-[480px]:text-sm">Đã bán {sold}</span>;
}
