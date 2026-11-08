"use client";

import { useCallback, useRef, useState } from "react";

// Chiều rộng hiện tại (px) của một phần tử, cập nhật khi cửa sổ đổi cỡ. Biểu đồ vẽ đúng số px này,
// nên chữ không bị kéo giãn như khi co một SVG cố định.
// Đo ngay khi phần tử được gắn vào trang (không chờ ResizeObserver, vốn không chạy khi tab đang ẩn).
export function useElementWidth<T extends HTMLElement>() {
  const [width, setWidth] = useState(0);
  const observer = useRef<ResizeObserver | null>(null);

  const ref = useCallback((element: T | null) => {
    observer.current?.disconnect();
    observer.current = null;
    if (!element) return;
    setWidth(Math.round(element.getBoundingClientRect().width));
    observer.current = new ResizeObserver((entries) => setWidth(Math.round(entries[0].contentRect.width)));
    observer.current.observe(element);
  }, []);

  return { ref, width };
}
