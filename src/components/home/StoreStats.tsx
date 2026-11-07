"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/context/StoreContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { provinceOf } from "@/lib/products";

const DURATION_MS = 1400;

// Vài con số về cửa hàng, đếm THẬT từ danh sách sản phẩm (Admin thêm/xóa thì số đổi theo).
// Khi khối này được cuộn tới, các số chạy từ 0 lên giá trị thật (nhanh rồi chậm dần), MỘT lần.
// Người bật "giảm chuyển động" thấy ngay số cuối.
export default function StoreStats() {
  const { isReady, products } = useStore();
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDListElement>(null);
  const [progress, setProgress] = useState(0); // 0 -> 1 trong DURATION_MS

  useEffect(() => {
    const element = ref.current;
    if (!isReady || !element) return;
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / DURATION_MS, 1);
        setProgress(t);
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [isReady]);

  const eased = reducedMotion ? 1 : 1 - (1 - progress) ** 3;
  const stats = [
    { label: "đặc sản", value: products.length },
    { label: "tỉnh thành", value: new Set(products.map((product) => provinceOf(product.origin))).size },
    { label: "thương hiệu", value: new Set(products.map((product) => product.brand)).size },
    { label: "vùng miền", value: new Set(products.map((product) => product.region)).size },
  ];

  return (
    <dl ref={ref} className="mt-5 grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        // <dt> phải đứng trước <dd> trong mã; flex-col-reverse đưa con số lên trên khi hiển thị
        <div key={stat.label} className="flex flex-col-reverse rounded-lg bg-white px-3 py-3 text-center">
          <dt className="mt-1 text-sm text-ink-muted">{stat.label}</dt>
          {/* Trình đọc màn hình đọc số cuối, không đọc từng bước đếm */}
          <dd className="font-display text-4xl font-bold leading-none tabular-nums text-primary">
            <span aria-hidden="true">{isReady ? Math.round(stat.value * eased) : "–"}</span>
            <span className="sr-only">{isReady ? stat.value : ""}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
