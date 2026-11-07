"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";

// Nút tròn ở góc dưới bên phải: hiện ra khi đã cuộn xuống quá 600px, bấm thì cuộn mượt về đầu trang.
// Cuộn mượt nhờ `scroll-behavior: smooth` trong globals.css (tự tắt với người bật "giảm chuyển động").
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 600);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0 })}
      aria-label="Lên đầu trang"
      // Khi ẩn: trong suốt, không bấm được và bị bỏ qua khi dùng phím Tab
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={`fixed bottom-4 right-4 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-card transition-all duration-300 hover:bg-primary-dark sm:bottom-6 sm:right-6 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <Icon name="arrow" size={20} className="-rotate-90" />
    </button>
  );
}
