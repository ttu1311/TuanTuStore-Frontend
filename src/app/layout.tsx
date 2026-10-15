import type { Metadata } from "next";
import { Be_Vietnam_Pro, Phudu } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";

// Phudu: a condensed display face made in Vietnam, close to hand-painted shop signs. Full Vietnamese accents.
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
    // data-scroll-behavior="smooth": smooth scrolling stays for "#section" links on a page,
    // but Next.js turns it off while changing pages, so every new page opens at the top
    <html lang="vi" data-scroll-behavior="smooth" className={`${displayFont.variable} ${sansFont.variable}`}>
      <body>
        {/* All website data (products, users, orders, cart) lives in the browser: see src/context/StoreContext.tsx */}
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
