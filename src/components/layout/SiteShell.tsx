import type { ReactNode } from "react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import BackToTop from "@/components/layout/BackToTop";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

// Khung của mọi trang cửa hàng: dải thông báo và Header ở trên, trang ở giữa, Footer ở dưới, nút "Lên đầu trang" ở góc.
// Chỉ dùng MỘT LẦN, bởi src/app/(shop)/layout.tsx (và bởi trang 404, nằm ngoài nhóm đó).
// Các trang Admin có khung riêng (src/components/admin/AdminShell.tsx).
export default function SiteShell({ children }: { children: ReactNode }) {
  return (
    // min-h-screen + flex-1: trang ngắn vẫn đẩy Footer xuống đáy màn hình
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
