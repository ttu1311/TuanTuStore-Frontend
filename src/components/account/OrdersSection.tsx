"use client";

import Link from "next/link";
import { useState } from "react";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import CancelOrderButton from "@/components/orders/CancelOrderButton";
import BankTransferQR from "@/components/payment/BankTransferQR";
import PaymentStatusBadge from "@/components/payment/PaymentStatusBadge";
import Stars from "@/components/reviews/Stars";
import { ReviewForm, ratingLabels } from "@/components/reviews/ProductReviews";
import { btnBase, btnPrimary } from "@/components/ui/buttons";
import { useStore } from "@/context/StoreContext";
import { formatDate, formatVND } from "@/lib/format";
import { customerCanCancel, paymentStatusOf } from "@/lib/orders";

// "Lịch sử mua hàng": chỉ gồm đơn của người đang đăng nhập, mới nhất lên đầu.
// Đơn đã hoàn thành (khách đã nhận hàng): mỗi món có nút chấm sao và nhận xét. Đánh giá này cũng hiện ở trang chi tiết sản phẩm.
export default function OrdersSection({ userId }: { userId: string }) {
  const { orders } = useStore();
  const myOrders = orders
    .filter((order) => order.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  // Mã của đơn hàng đang mở chi tiết
  const [openCode, setOpenCode] = useState<string | null>(null);

  return (
    // Tiêu đề "Lịch sử mua hàng" là tiêu đề của cả trang (AccountShell), không lặp lại ở đây
    <div>
      {myOrders.length === 0 ? (
        <div className="rounded-xl border border-line bg-surface px-6 py-12 text-center">
          <p className="text-ink-muted">Bạn chưa có đơn hàng nào.</p>
          <Link href="/san-pham" className={`${btnBase} ${btnPrimary} mt-4`}>
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {myOrders.map((order) => {
            const isOpen = openCode === order.code;
            return (
              <li key={order.code} className="rounded-xl border border-line bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">Mã đơn hàng: {order.code}</p>
                    <p className="text-sm text-ink-muted">Ngày đặt: {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <PaymentStatusBadge order={order} />
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-ink-muted">
                    Tổng tiền: <span className="text-lg font-bold text-primary">{formatVND(order.total)}</span>
                  </p>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenCode(isOpen ? null : order.code)}
                    className="min-h-11 text-sm font-medium text-primary underline underline-offset-4 hover:text-primary-dark"
                  >
                    {isOpen ? "Ẩn chi tiết" : order.status === "COMPLETED" ? "Xem chi tiết và đánh giá" : "Xem chi tiết"}
                  </button>
                </div>

                {/* Còn "Chờ xác nhận" thì khách tự hủy được; cửa hàng đã xác nhận thì không */}
                {customerCanCancel(order) && <CancelOrderButton code={order.code} />}

                {isOpen && paymentStatusOf(order) === "UNPAID" && order.status !== "CANCELLED" && (
                  <div className="mt-3">
                    <BankTransferQR orderCode={order.code} amount={order.total} />
                  </div>
                )}
                {isOpen && (
                  <ul className="mt-3 divide-y divide-line border-t border-line">
                    {order.items.map((item) => (
                      <li key={item.productId} className="py-2">
                        <div className="flex justify-between gap-4 text-ink-muted">
                          <span className="min-w-0">
                            {item.name}
                            <span className="block text-xs">
                              {formatVND(item.price)} x {item.quantity}
                            </span>
                          </span>
                          <span className="whitespace-nowrap font-medium text-ink">{formatVND(item.price * item.quantity)}</span>
                        </div>
                        {order.status === "COMPLETED" && <ItemReview productId={item.productId} userId={userId} />}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// Đánh giá một món của đơn đã hoàn thành: số sao đã chấm (nếu có) và nút mở form viết / sửa đánh giá
function ItemReview({ productId, userId }: { productId: string; userId: string }) {
  const { products, reviews } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  // Sản phẩm đã bị xóa khỏi cửa hàng thì không đánh giá được nữa
  if (!products.some((product) => product.id === productId)) return null;
  const myReview = reviews.find((review) => review.productId === productId && review.userId === userId);

  return (
    <div className="mt-1">
      <div className="flex flex-wrap items-center gap-x-3">
        {myReview && (
          <span className="flex items-center gap-2 text-sm text-ink-muted">
            <Stars value={myReview.rating} size={16} />
            {ratingLabels[myReview.rating]}
            <span className="sr-only">, bạn đã chấm {myReview.rating} trên 5 sao</span>
          </span>
        )}
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
          className="min-h-11 text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          {isOpen ? "Đóng" : myReview ? "Sửa đánh giá" : "Đánh giá sản phẩm"}
        </button>
      </div>
      {isOpen && (
        <div className="mt-1">
          <ReviewForm productId={productId} existing={myReview} />
        </div>
      )}
    </div>
  );
}
