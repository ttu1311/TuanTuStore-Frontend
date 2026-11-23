"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useStore } from "@/context/StoreContext";
import { hasUserScrolled, resetUserScrolled } from "@/lib/scrollWatcher";

const WAIT_FOR_TARGET_MS = 3000;
const CHECK_EVERY_MS = 100;

// Mở một địa chỉ có "#phần" (ví dụ /#lien-he, link cũ /lien-he chuyển tới đây) thì cuộn tới phần đó SAU KHI dữ liệu đã tải xong.
// Lý do: ở lần vẽ đầu các danh sách còn trống ("Đang tải…"), trình duyệt cuộn theo "#" ngay lúc trang còn ngắn; khi sản phẩm
// hiện ra, trang dài thêm và phần ở cuối trang (footer, id="lien-he") bị đẩy xuống khỏi màn hình.
//
// Quy tắc:
// - MỘT lần cho mỗi lần chuyển trang có "#" (nhớ trong `handled`), không lặp lại khi dữ liệu đổi.
// - Không chờ cố định: cuộn ngay khi isReady và phần tử đích đã có trên trang; chưa có thì kiểm tra lại mỗi 100ms, quá 3 giây thì thôi.
// - Người dùng đã tự cuộn trước khi nó chạy thì hủy, không giật trang khỏi chỗ họ đang xem. Việc theo dõi nằm trong
//   src/lib/scrollWatcher.ts và bắt đầu từ lúc trình duyệt đọc HTML, trước cả React.
// Scroll-padding của html chừa chỗ cho Header dính.
export default function ScrollToHash() {
  const { isReady } = useStore();
  const pathname = usePathname();
  const handled = useRef("");
  const lastPath = useRef<string | null>(null);

  // Chuyển sang trang khác: được cuộn lại một lần nữa, và tính việc người dùng tự cuộn từ đầu.
  // (Lần gắn đầu tiên không đặt lại: người dùng có thể đã cuộn trước đó. Kiểm tra bằng đường dẫn cũ để StrictMode, vốn chạy
  // effect hai lần ở bản dev, không đặt lại nhầm.)
  useEffect(() => {
    if (lastPath.current !== null && lastPath.current !== pathname) {
      handled.current = "";
      resetUserScrolled();
    }
    lastPath.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!isReady) return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    const key = `${pathname}#${id}`;
    if (!id || handled.current === key) return;
    handled.current = key;

    const startedAt = Date.now();
    let finished = false;
    // Xong việc khi: đã cuộn, hoặc người dùng đã tự cuộn, hoặc quá 3 giây mà phần tử vẫn chưa có
    const attempt = () => {
      if (hasUserScrolled()) finished = true;
      else {
        const target = document.getElementById(id);
        if (target) {
          target.scrollIntoView();
          finished = true;
        } else if (Date.now() - startedAt >= WAIT_FOR_TARGET_MS) finished = true;
      }
      return finished;
    };
    if (attempt()) return; // phần tử đã có sẵn: cuộn ngay, không đợi nhịp kiểm tra đầu tiên
    const timer = window.setInterval(() => {
      if (attempt()) window.clearInterval(timer);
    }, CHECK_EVERY_MS);
    return () => {
      window.clearInterval(timer);
      // Bị dừng giữa chừng (effect chạy lại) mà chưa xong thì cho phép lần chạy sau làm tiếp
      if (!finished) handled.current = "";
    };
  }, [isReady, pathname]);

  return null;
}
