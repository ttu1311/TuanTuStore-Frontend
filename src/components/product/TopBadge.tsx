"use client";

import { useStore } from "@/context/StoreContext";
import { topSellerRanks } from "@/lib/products";
import { soldCounts } from "@/lib/reviews";

// Nhãn "Top 1/2/3" ở góc ảnh sản phẩm: tự tính từ SỐ LƯỢNG ĐÃ BÁN (Admin không đặt được).
// Chỉ 3 món bán nhiều nhất, và chỉ món đã bán được; cửa hàng chưa có đơn nào thì không có nhãn.
export default function TopBadge({ productId }: { productId: string }) {
  const { isReady, products, orders, productViews } = useStore();
  if (!isReady) return null;

  const rank = topSellerRanks(products, soldCounts(orders), productViews).get(productId);
  if (!rank) return null;

  return (
    <span className="absolute left-3 top-3 rounded bg-paper px-2 py-1 text-xs font-semibold text-ink">
      Top {rank}
      <span className="sr-only"> bán chạy</span>
    </span>
  );
}
