import type { Config } from "tailwindcss";

// Các design token của TuanTuStore. Đổi một giá trị ở đây thì cả website thay đổi theo.
// Bảng màu lấy từ chính các sản phẩm: chàm (thuốc nhuộm xanh chàm) cho chữ và hành động,
// và một màu cho mỗi vùng — chè (xanh lá trà) cho Bắc, cà phê (rang đậm) cho Trung, nước mắm (hổ phách) cho Nam.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  future: {
    // Kiểu :hover chỉ áp dụng trên thiết bị thật sự có thể rê chuột (không phải màn hình cảm ứng)
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: {
        paper: "#FCFCFA", // nền trang
        ink: { DEFAULT: "#1C2333", muted: "#586074" },
        line: "#DEE0E3",
        surface: "#F0F1EE", // xám giấy gạo lạnh, dùng cho các phần xen kẽ
        primary: { DEFAULT: "#24315A", dark: "#18213F", soft: "#E5E8F1" }, // xanh chàm
        che: { DEFAULT: "#3F6A3B", soft: "#E4EDE1" }, // Miền Bắc — xanh lá trà
        brown: { DEFAULT: "#5B3B2A", soft: "#F0E7E1" }, // Miền Trung — cà phê rang đậm
        gold: { DEFAULT: "#C7891F", ink: "#7A4F05", soft: "#F8EDD5", light: "#E2B65C" }, // Miền Nam — hổ phách của nước mắm
        sale: "#B3261E",
        footer: { DEFAULT: "#18213F", text: "#DDE1EC", muted: "#A6AEC4" },
      },
      fontFamily: {
        // --font-display / --font-sans được đặt trong src/app/layout.tsx
        display: ["var(--font-display)", "Arial Narrow", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      fontSize: {
        // Phudu là kiểu chữ hẹp, nên tiêu đề lớn hơn một cỡ so với kiểu chữ có độ rộng thông thường
        title: ["2.75rem", { lineHeight: "1.05" }], // tiêu đề các phần (44px)
        hero: ["6rem", { lineHeight: "0.92" }], // tiêu đề hero (96px)
      },
      maxWidth: {
        container: "1280px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(28, 35, 51, 0.05), 0 10px 28px rgba(28, 35, 51, 0.08)",
        soft: "0 1px 2px rgba(28, 35, 51, 0.05)",
      },
      scrollPadding: {
        header: "140px",
      },
    },
  },
  plugins: [],
};

export default config;
