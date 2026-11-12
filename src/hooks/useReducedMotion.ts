"use client";

import { useSyncExternalStore } from "react";

// Người dùng có bật "giảm chuyển động" trong hệ điều hành không? Khi đó banner trang chủ không tự chuyển ảnh.
// Trên server (và ở lần vẽ đầu) trả về false; trình duyệt cập nhật ngay sau đó, và cả khi người dùng đổi cài đặt.
const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

export function useReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );
}
