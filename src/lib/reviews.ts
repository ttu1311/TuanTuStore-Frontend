// Đánh giá và số đã bán. Mọi con số đều đếm từ dữ liệu thật trong localStorage (không có đánh giá hay lượt bán mẫu).
import type { Order, Review, User } from "@/types";

export const MAX_COMMENT_LENGTH = 500;

// Khách này có được đánh giá sản phẩm này không, và nếu không thì vì sao
export type ReviewEligibility = "login" | "not-bought" | "not-received" | "can-review";

export function reviewEligibility(user: User | null, orders: Order[], productId: string): ReviewEligibility {
  if (!user) return "login";
  // Đơn đã hủy không tính là đã mua
  const myOrders = orders.filter(
    (order) =>
      order.userId === user.id && order.status !== "CANCELLED" && order.items.some((item) => item.productId === productId)
  );
  if (myOrders.length === 0) return "not-bought";
  // Chỉ đánh giá khi đã nhận hàng: đơn có sản phẩm này đã "Hoàn thành"
  return myOrders.some((order) => order.status === "COMPLETED") ? "can-review" : "not-received";
}

export type RatingSummary = { average: number; count: number; stars: Record<1 | 2 | 3 | 4 | 5, number> };

export function ratingSummary(reviews: Review[]): RatingSummary {
  const stars = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const review of reviews) stars[review.rating as 1 | 2 | 3 | 4 | 5] += 1;
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return { average: reviews.length ? total / reviews.length : 0, count: reviews.length, stars };
}

// 4.333 -> "4,3" (dấu phẩy thập phân kiểu Việt)
export function formatRating(average: number) {
  return average.toFixed(1).replace(".", ",");
}

// Số đã bán của mỗi sản phẩm: cộng số lượng trong mọi đơn hàng đã đặt
// Đơn đã hủy không tính (hàng đã trả về kho)
export function soldCounts(orders: Order[]) {
  const counts = new Map<string, number>();
  for (const order of orders) {
    if (order.status === "CANCELLED") continue;
    for (const item of order.items) counts.set(item.productId, (counts.get(item.productId) ?? 0) + item.quantity);
  }
  return counts;
}
