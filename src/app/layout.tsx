import type { Metadata } from "next";
import { Be_Vietnam_Pro, Phudu } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";

// Phudu: kiểu chữ tiêu đề hẹp do người Việt thiết kế, gần với biển hiệu quán vẽ tay. Đủ dấu tiếng Việt.
const displayFont = Phudu({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const sansFont = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TuanTuStore — Tinh hoa đặc sản Việt",
  description: "TuanTuStore — cửa hàng đặc sản ba miền Bắc, Trung, Nam được chọn lọc, rõ nguồn gốc.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-scroll-behavior="smooth": cuộn mượt vẫn giữ cho các liên kết "#section" trong một trang,
    // nhưng Next.js tắt nó khi chuyển trang, nên mỗi trang mới luôn mở ở đầu trang
    <html lang="vi" data-scroll-behavior="smooth" className={`${displayFont.variable} ${sansFont.variable}`}>
      <body>
        {/* Toàn bộ dữ liệu website (sản phẩm, người dùng, đơn hàng, giỏ hàng) nằm trong trình duyệt: xem src/context/StoreContext.tsx */}
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
