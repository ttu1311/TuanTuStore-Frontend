import type { Config } from "tailwindcss";

// Các design token của Đặc sản 3 Miền. Đổi một giá trị ở đây thì cả website thay đổi theo.
// Màu chủ đạo là cam nghệ (primary), cộng một màu cho mỗi vùng:
// chè (xanh lá trà) cho Bắc, cà phê (rang đậm) cho Trung, nước mắm (hổ phách) cho Nam.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  future: {
    // Kiểu :hover chỉ áp dụng trên thiết bị thật sự có thể rê chuột (không phải màn hình cảm ứng)
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: {
        // Mã màu thật nằm ở src/app/globals.css (biến --c-*): đổi màu ở đó, dev server cập nhật ngay, không cần xóa cache
        paper: "rgb(var(--c-paper) / <alpha-value>)",
        ink: { DEFAULT: "rgb(var(--c-ink) / <alpha-value>)", muted: "rgb(var(--c-ink-muted) / <alpha-value>)" },
        line: "rgb(var(--c-line) / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        primary: { DEFAULT: "rgb(var(--c-primary) / <alpha-value>)", dark: "rgb(var(--c-primary-dark) / <alpha-value>)", soft: "rgb(var(--c-primary-soft) / <alpha-value>)" },
        che: { DEFAULT: "rgb(var(--c-che) / <alpha-value>)", soft: "rgb(var(--c-che-soft) / <alpha-value>)" },
        brown: { DEFAULT: "rgb(var(--c-brown) / <alpha-value>)", soft: "rgb(var(--c-brown-soft) / <alpha-value>)" },
        gold: { DEFAULT: "rgb(var(--c-gold) / <alpha-value>)", ink: "rgb(var(--c-gold-ink) / <alpha-value>)", soft: "rgb(var(--c-gold-soft) / <alpha-value>)", light: "rgb(var(--c-gold-light) / <alpha-value>)" },
        sale: "rgb(var(--c-sale) / <alpha-value>)",
      },
      fontFamily: {
        // Cả website dùng Arial (font có sẵn trong máy, không tải font web). `display` (tiêu đề) và `sans` (chữ thường)
        // giống nhau, giữ hai tên để các class font-display ở tiêu đề vẫn dùng được. Riêng tên cửa hàng ở logo dùng Lora
        // (--font-brand, nạp ở src/app/layout.tsx).
        display: ["Arial", '"Helvetica Neue"', "Helvetica", "sans-serif"],
        sans: ["Arial", '"Helvetica Neue"', "Helvetica", "sans-serif"],
      },
      fontSize: {
        // Arial rộng hơn font hẹp trước đây (Phudu), nên tiêu đề nhỏ lại; dòng cao hơn để dấu tiếng Việt không chạm dòng trên
        title: ["2.25rem", { lineHeight: "1.2" }], // tiêu đề các phần (36px)
      },
      maxWidth: {
        container: "1280px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(28, 35, 51, 0.05), 0 10px 28px rgba(28, 35, 51, 0.08)",
      },
      scrollPadding: {
        header: "140px",
      },
      // Chuyển động của trang chủ. Người bật "giảm chuyển động" thì chúng bị tắt (xem globals.css).
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        progress: {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
        // Ảnh món vừa chọn hiện ra trong ô của hộp quà (Hộp quà Ba Miền)
        "pop-in": {
          from: { opacity: "0", transform: "scale(0.6)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "cart-pop": {
          "0%, 100%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.35)" },
        },
        // Vệt sáng lướt qua nhãn "-X%" của thẻ ưu đãi: lướt trong nửa đầu chu kỳ, nửa sau nghỉ (vệt nằm ngoài nhãn nên không thấy)
        shimmer: {
          "0%": { transform: "translateX(-150%)" },
          "50%, 100%": { transform: "translateX(350%)" },
        },
        // Ba vạch sóng âm trên nút nhạc nền khi đang phát (tắt khi người dùng bật "giảm chuyển động")
        equalizer: {
          "0%, 100%": { transform: "scaleY(0.35)" },
          "50%": { transform: "scaleY(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        progress: "progress 3s linear both", // một ảnh của banner trang chủ (SLIDE_SECONDS trong HeroBanner)
        "pop-in": "pop-in 0.3s ease-out both",
        "cart-pop": "cart-pop 0.4s ease-out",
        equalizer: "equalizer 0.9s ease-in-out infinite",
        shimmer: "shimmer 3.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
