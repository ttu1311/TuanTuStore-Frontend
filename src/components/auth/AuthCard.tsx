"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Khung chung của trang đăng nhập / đăng ký: một cột căn giữa, không có Sidebar.
// Khi trang mở ra (kể cả khi bấm chuyển giữa đăng nhập và đăng ký), form được cuộn vào GIỮA phần màn hình
// nhìn thấy được (dưới Header), nên người dùng không phải kéo chuột xuống để thấy các ô nhập và nút gửi.
export default function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Chờ một nhịp: Next.js tự cuộn về đầu trang sau khi chuyển trang, nên phải cuộn SAU việc đó
    const timer = window.setTimeout(() => {
      const card = cardRef.current;
      if (!card) return;
      // Phần màn hình nhìn thấy được = từ đáy Header dính (cao hơn trên điện thoại vì có thêm hàng menu) đến đáy cửa sổ
      const headerBottom = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
      const visibleHeight = window.innerHeight - headerBottom;
      const rect = card.getBoundingClientRect();
      // Form cao hơn phần nhìn thấy (máy tính nhỏ): ưu tiên thấy tiêu đề và các ô đầu, không cắt cả hai đầu
      const wantedTop = rect.height > visibleHeight ? headerBottom + 8 : headerBottom + (visibleHeight - rect.height) / 2;
      window.scrollBy({ top: rect.top - wantedTop, behavior: "instant" });
    }, 50);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="mx-auto w-full max-w-[480px] px-4 py-6 md:px-6 lg:py-10">
      <div ref={cardRef} className="rounded-xl border border-line bg-white p-6">
        <h1 className="mb-4 font-display text-3xl font-semibold leading-tight text-ink">{title}</h1>
        {children}
      </div>
    </div>
  );
}
