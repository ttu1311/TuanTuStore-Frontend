import type { Metadata } from "next";
import { Lora } from "next/font/google";
import "./globals.css";
import { MusicProvider } from "@/context/MusicContext";
import { StoreProvider } from "@/context/StoreContext";

// Chữ của cả website là Arial (font có sẵn trong máy, không tải font web): xem fontFamily trong tailwind.config.ts.
// Font web DUY NHẤT còn lại là Lora: chữ có chân, dùng cho tên cửa hàng trong logo (src/components/brand/Logo.tsx)
// và dòng chữ nghiêng ở banner trang chủ, vì đó là nhận diện của cửa hàng. Đủ dấu tiếng Việt.
const brandFont = Lora({
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700"],
  style: ["normal", "italic"],
  variable: "--font-brand",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Đặc sản 3 Miền — Quà quê từ Bắc vào Nam",
  description: "Đặc sản 3 Miền — cửa hàng quà quê Bắc, Trung, Nam được chọn lọc, rõ nguồn gốc.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-scroll-behavior="smooth": cuộn mượt vẫn giữ cho các liên kết "#section" trong một trang,
    // nhưng Next.js tắt nó khi chuyển trang, nên mỗi trang mới luôn mở ở đầu trang
    <html lang="vi" data-scroll-behavior="smooth" className={brandFont.variable}>
      <body>
        {/* Toàn bộ dữ liệu website (sản phẩm, người dùng, đơn hàng, giỏ hàng) nằm trong trình duyệt: xem src/context/StoreContext.tsx */}
        <StoreProvider>
          {/* Nhạc nền: <audio> nằm ở đây (layout gốc không bị dựng lại khi chuyển trang), nên nhạc không ngắt. Xem src/context/MusicContext.tsx */}
          <MusicProvider>{children}</MusicProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
