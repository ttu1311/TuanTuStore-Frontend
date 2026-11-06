import type { ReactNode } from "react";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

// Khung của mọi trang cửa hàng: Header ở trên, trang ở giữa, Footer ở dưới.
// Chỉ dùng MỘT LẦN, bởi src/app/(shop)/layout.tsx (và bởi trang 404, nằm ngoài nhóm đó).
// Các trang Admin có khung riêng (src/components/admin/AdminShell.tsx).
export default function SiteShell({ children }: { children: ReactNode }) {
  return (
    // min-h-screen + flex-1: trang ngắn vẫn đẩy Footer xuống đáy màn hình
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
