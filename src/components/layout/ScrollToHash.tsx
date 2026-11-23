"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useStore } from "@/context/StoreContext";

// Mở một địa chỉ có "#phần" (ví dụ /#lien-he, link cũ /lien-he chuyển tới đây) thì cuộn tới phần đó SAU KHI dữ liệu đã tải xong.
// Lý do: ở lần vẽ đầu các danh sách còn trống ("Đang tải…"), trình duyệt cuộn theo "#" ngay lúc trang còn ngắn; khi sản phẩm
// hiện ra, trang dài thêm và phần ở cuối trang (footer, id="lien-he") bị đẩy xuống khỏi màn hình.
// Chỉ chạy khi có "#" trong địa chỉ; scroll-padding của html chừa chỗ cho Header dính.
export default function ScrollToHash() {
  const { isReady } = useStore();
  const pathname = usePathname();

  useEffect(() => {
    if (!isReady) return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const frame = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
    return () => cancelAnimationFrame(frame);
  }, [isReady, pathname]);

  return null;
}
