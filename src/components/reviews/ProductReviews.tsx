"use client";

import Link from "next/link";
import { useState } from "react";
import Stars from "@/components/reviews/Stars";
import { btnBase, btnPrimary, btnSmall } from "@/components/ui/buttons";
import { useStore } from "@/context/StoreContext";
import { formatDate } from "@/lib/format";
import { MAX_COMMENT_LENGTH, formatRating, ratingSummary, reviewEligibility } from "@/lib/reviews";
import type { Review } from "@/types";
import { loginUrl } from "@/lib/redirect";

const ratingLabels = ["", "Rất tệ", "Chưa hài lòng", "Bình thường", "Hài lòng", "Rất hài lòng"];

// Phần "Đánh giá của khách hàng" ở trang chi tiết sản phẩm.
// Chỉ khách đã NHẬN hàng (có đơn "Hoàn thành" chứa sản phẩm này) mới viết được; StoreContext kiểm tra lại điều này.
export default function ProductReviews({ productId }: { productId: string }) {
  const { reviews, orders, currentUser, deleteReview } = useStore();
  const productReviews = reviews
    .filter((review) => review.productId === productId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const summary = ratingSummary(productReviews);
  const eligibility = reviewEligibility(currentUser, orders, productId);
  const myReview = currentUser ? productReviews.find((review) => review.userId === currentUser.id) : undefined;

  return (
    <section id="danh-gia" aria-labelledby="reviews-title">
      <h2 id="reviews-title" className="font-display text-2xl font-semibold text-ink">
        Đánh giá của khách hàng
      </h2>

      <div className="mt-4 grid gap-6 rounded-xl border border-line bg-white p-6 md:grid-cols-[12rem_1fr]">
        {/* Điểm trung bình và số đánh giá */}
        <div className="text-center md:border-r md:border-line md:pr-6">
          <p className="font-display text-5xl font-bold text-ink">{summary.count ? formatRating(summary.average) : "–"}</p>
          <div className="mt-2 flex justify-center">
            <Stars value={summary.average} size={20} />
          </div>
          <p className="mt-2 text-sm text-ink-muted">
            {summary.count ? `${summary.count} đánh giá` : "Chưa có đánh giá"}
            {summary.count > 0 && <span className="sr-only">, trung bình {formatRating(summary.average)} trên 5 sao</span>}
          </p>
        </div>
        {/* Số đánh giá của từng mức sao */}
        <ul aria-label="Phân bố số sao" className="space-y-1.5">
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = summary.stars[star];
            const percent = summary.count ? (count / summary.count) * 100 : 0;
            return (
              <li key={star} className="flex items-center gap-3 text-sm">
                <span className="w-10 shrink-0 text-ink-muted">{star} sao</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
                  <span className="block h-full rounded-full bg-gold" style={{ width: `${percent}%` }} />
                </span>
                <span className="w-6 shrink-0 text-right tabular-nums text-ink-muted">{count}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-6">
        {eligibility === "can-review" ? (
          // key: người khác đăng nhập thì form bắt đầu lại từ đánh giá của người đó
          <ReviewForm key={currentUser?.id} productId={productId} existing={myReview} />
        ) : (
          <p className="rounded-lg bg-surface px-4 py-3 text-sm text-ink-muted">
            {eligibility === "login" && (
              <>
                <Link
                  href={loginUrl(`/san-pham/${productId}#danh-gia`)}
                  className="font-medium text-primary underline underline-offset-4"
                >
                  Đăng nhập
                </Link>{" "}
                để viết đánh giá. Chỉ khách đã nhận hàng mới đánh giá được, để mọi đánh giá đều là của người đã dùng sản phẩm.
              </>
            )}
            {eligibility === "not-bought" && "Chỉ khách đã mua và nhận sản phẩm này mới viết được đánh giá."}
            {eligibility === "not-received" &&
              "Bạn sẽ viết được đánh giá khi đơn hàng có sản phẩm này đã hoàn thành (bạn đã nhận hàng)."}
          </p>
        )}
      </div>

      {productReviews.length > 0 && (
        <ul className="mt-6 divide-y divide-line rounded-xl border border-line bg-white px-6">
          {productReviews.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              canDelete={Boolean(currentUser && (currentUser.id === review.userId || currentUser.role === "ADMIN"))}
              onDelete={() => deleteReview(review.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function ReviewItem({ review, canDelete, onDelete }: { review: Review; canDelete: boolean; onDelete: () => void }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <li className="py-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-semibold text-ink">{review.userName}</span>
        <span className="rounded-full bg-che-soft px-2 py-0.5 text-xs font-semibold text-che">Đã mua hàng</span>
        <span className="text-sm text-ink-muted">{formatDate(review.createdAt)}</span>
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <Stars value={review.rating} size={16} />
        <span className="text-sm text-ink-muted">
          {ratingLabels[review.rating]}
          <span className="sr-only">, {review.rating} trên 5 sao</span>
        </span>
      </div>
      <p className="mt-2 whitespace-pre-line text-ink">{review.comment}</p>
      {canDelete &&
        (confirming ? (
          <p className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <span className="text-ink-muted">Xóa đánh giá này?</span>
            <button type="button" onClick={onDelete} className="min-h-11 font-semibold text-sale">
              Xóa
            </button>
            <button type="button" onClick={() => setConfirming(false)} className="min-h-11 font-medium text-ink-muted">
              Hủy
            </button>
          </p>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="mt-1 min-h-11 text-sm font-medium text-ink-muted underline underline-offset-4 hover:text-sale"
          >
            Xóa đánh giá
          </button>
        ))}
    </li>
  );
}

function ReviewForm({ productId, existing }: { productId: string; existing?: Review }) {
  const { submitReview } = useStore();
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [error, setError] = useState<{ field?: string; message: string } | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaved(false);
    const result = submitReview(productId, rating, comment);
    if (result.ok) {
      setError(null);
      setSaved(true);
    } else {
      setError({ field: result.field, message: result.message });
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="rounded-xl border border-line bg-white p-6">
      <h3 className="font-semibold text-ink">{existing ? "Sửa đánh giá của bạn" : "Viết đánh giá của bạn"}</h3>

      <fieldset className="mt-4 border-0 p-0">
        <legend className="mb-2 text-sm font-medium text-ink">Bạn chấm mấy sao?</legend>
        <div className="flex flex-wrap items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <label
              key={star}
              className="cursor-pointer rounded-md p-1.5 has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-primary-soft"
            >
              <input
                type="radio"
                name="rating"
                value={star}
                checked={rating === star}
                onChange={() => {
                  setRating(star);
                  if (error?.field === "rating") setError(null);
                }}
                className="sr-only"
              />
              <span className="sr-only">
                {star} sao: {ratingLabels[star]}
              </span>
              <svg aria-hidden="true" width={30} height={30} viewBox="0 0 24 24" className={star <= rating ? "text-gold" : "text-line"}>
                <path d="m12 2.5 2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8Z" fill="currentColor" />
              </svg>
            </label>
          ))}
          {rating > 0 && <span className="ml-2 text-sm font-medium text-ink">{ratingLabels[rating]}</span>}
        </div>
      </fieldset>

      <label htmlFor="review-comment" className="mb-2 mt-4 block text-sm font-medium text-ink">
        Nhận xét
      </label>
      <textarea
        id="review-comment"
        rows={4}
        value={comment}
        maxLength={MAX_COMMENT_LENGTH}
        onChange={(event) => {
          setComment(event.target.value);
          setSaved(false);
          if (error?.field === "comment") setError(null);
        }}
        placeholder="Hương vị, đóng gói, có hợp làm quà không…"
        aria-invalid={error?.field === "comment" ? true : undefined}
        className={`w-full rounded-lg border bg-white px-4 py-3 text-ink transition-colors duration-200 placeholder:text-[#686D69] focus:outline-none focus:ring-[3px] ${
          error?.field === "comment" ? "border-sale focus:ring-sale/20" : "border-line focus:border-primary focus:ring-primary-soft"
        }`}
      />
      <p className="mt-1 text-right text-sm text-ink-muted">
        {comment.trim().length}/{MAX_COMMENT_LENGTH}
      </p>

      {error && (
        <p role="alert" className="mt-2 text-sm text-sale">
          {error.message}
        </p>
      )}
      {saved && (
        <p role="status" className="mt-2 text-sm font-medium text-che">
          Cảm ơn bạn! Đánh giá đã được lưu.
        </p>
      )}
      <button type="submit" className={`${btnBase} ${btnPrimary} ${btnSmall} mt-4`}>
        {existing ? "Cập nhật đánh giá" : "Gửi đánh giá"}
      </button>
    </form>
  );
}
