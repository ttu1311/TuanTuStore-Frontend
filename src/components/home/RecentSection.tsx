"use client";

import RecentlyViewed from "@/components/product/RecentlyViewed";
import { useStore } from "@/context/StoreContext";

// "Đã xem gần đây" ở Sidebar trang chủ. Chỉ hiển thị sau khi đọc xong localStorage,
// vì danh sách này chỉ có ở trình duyệt (server render không có nó).
export default function RecentSection() {
  const { isReady, products } = useStore();
  return isReady ? <RecentlyViewed products={products} /> : null;
}
