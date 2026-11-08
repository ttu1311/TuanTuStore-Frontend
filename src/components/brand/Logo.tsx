// Logo "Đặc sản 3 Miền".
// Biểu tượng: một con dấu tròn màu kem; bên trong, dải đất chữ S của Việt Nam được vẽ thành SỐ 3,
// chia đúng 3 đoạn = 3 miền: Bắc xanh lúa, Trung đỏ cam, Nam vàng nắng. Cạnh đó là hai cụm chấm nhỏ:
// quần đảo Hoàng Sa và Trường Sa. Một chiếc lá non nhú ra khỏi con dấu ở đầu miền Bắc: đồ ăn tươi, quà quê.
// Chữ: "ĐẶC SẢN" (xanh lúa) + vạch 3 màu, dưới là "3 MIỀN" (đỏ cam, màu đặc trưng của site).
// Các bản: <Logo /> ngang cho header/footer, <Logo tone="dark" /> cho nền tối, <LogoMark /> chỉ biểu tượng.
// Favicon: src/app/icon.svg (cùng hình). Bản tệp rời: public/brand/*.svg.

export const brandColors = {
  north: "#2E8B3E", // Miền Bắc: xanh lúa
  central: "#CF3A10", // Miền Trung: đỏ cam (màu đặc trưng của site)
  south: "#F2A900", // Miền Nam: vàng nắng
  leaf: "#5BAA4A",
  seal: "#FFF8EC", // nền con dấu
  ring: "#F3C969", // viền con dấu
  textGreen: "#2E7D32", // chữ "ĐẶC SẢN" trên nền sáng (5,1:1)
  textRed: "#CF3A10", // chữ "3 MIỀN" trên nền sáng (4,9:1)
  darkGreen: "#9AD98A", // "ĐẶC SẢN" trên nền tối (9,9:1)
  darkCream: "#FFF1DC", // "3 MIỀN" trên nền tối (14,8:1)
};

// Chỉ biểu tượng (48×48). Nét dày, ít chi tiết, nên vẫn rõ ở cỡ favicon.
export function LogoMark({ size = 44, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" className={`shrink-0 overflow-visible ${className}`}>
      <circle cx="24" cy="24" r="23" fill={brandColors.seal} />
      <circle cx="24" cy="24" r="22.2" fill="none" stroke={brandColors.ring} strokeWidth="1.4" />
      {/* Lá non nhú ra khỏi con dấu */}
      <path d="M12.6 11.2 C7.4 10.6 5.6 6.2 7.2 2.9 C11 4 13.6 7 12.6 11.2 Z" fill={brandColors.leaf} />
      <path d="M12.4 10.6 L8.6 5.2" stroke={brandColors.north} strokeWidth="0.7" strokeLinecap="round" />
      {/* Số 3 = dải đất chữ S, ba đoạn ba miền */}
      <path d="M14 12 C19 6.5 30.5 7 30 14 C29.7 17.6 27 19.6 23.6 20.6" fill="none" stroke={brandColors.north} strokeWidth="5.6" strokeLinecap="round" />
      <path d="M26 23.2 C31.5 24.2 34 28.2 33 32" fill="none" stroke={brandColors.central} strokeWidth="5.6" strokeLinecap="round" />
      <path d="M31.2 35.6 C28.5 40 20.5 41 14.5 37.6" fill="none" stroke={brandColors.south} strokeWidth="5.6" strokeLinecap="round" />
      {/* Hoàng Sa và Trường Sa */}
      <g fill={brandColors.central}>
        <circle cx="38" cy="15.5" r="1.05" />
        <circle cx="40" cy="16.9" r="1.05" />
        <circle cx="38.6" cy="18.3" r="1.05" />
        <circle cx="39.6" cy="27.5" r="1.05" />
        <circle cx="41.4" cy="29.3" r="1.05" />
        <circle cx="39.8" cy="30.8" r="1.05" />
        <circle cx="41.6" cy="32.3" r="1.05" />
      </g>
    </svg>
  );
}

type LogoProps = {
  tone?: "light" | "dark"; // "dark": chữ sáng, dùng trên nền tối
  size?: "md" | "sm"; // sm: thanh bên trang Admin
  tagline?: boolean; // dòng nhỏ "Quà quê từ Bắc vào Nam" (ẩn trên điện thoại cho gọn)
  label?: string;
};

// Bản ngang: biểu tượng + chữ hai tầng. Chữ là chữ thật (font Phudu của site), nét sắc ở mọi cỡ, đọc rõ trên điện thoại.
export default function Logo({ tone = "light", size = "md", tagline = false, label = "Đặc sản 3 Miền — Quà quê từ Bắc vào Nam" }: LogoProps) {
  const dark = tone === "dark";
  const small = size === "sm";
  return (
    <span role="img" aria-label={label} className="inline-flex items-center gap-2.5">
      <LogoMark size={small ? 38 : 46} />
      <span aria-hidden="true" className="flex flex-col">
        {/* Tầng trên: ĐẶC SẢN + vạch 3 màu (Bắc, Trung, Nam) */}
        <span className="flex items-center gap-2">
          <span
            className={`whitespace-nowrap font-display font-bold uppercase leading-none tracking-[0.2em] ${small ? "text-[12px]" : "text-[14px] sm:text-[15px]"}`}
            style={{ color: dark ? brandColors.darkGreen : brandColors.textGreen }}
          >
            Đặc sản
          </span>
          <span className="flex h-[3px] min-w-6 flex-1 gap-[2px]" aria-hidden="true">
            <span className="flex-1 rounded-full" style={{ backgroundColor: brandColors.north }} />
            <span className="flex-1 rounded-full" style={{ backgroundColor: brandColors.central }} />
            <span className="flex-1 rounded-full" style={{ backgroundColor: brandColors.south }} />
          </span>
        </span>
        {/* Tầng dưới: 3 MIỀN */}
        <span
          className={`mt-1 whitespace-nowrap font-display font-bold uppercase leading-[0.95] ${small ? "text-[24px]" : "text-[30px] sm:text-[32px]"}`}
          style={{ color: dark ? brandColors.darkCream : brandColors.textRed }}
        >
          3 Miền
        </span>
        {tagline && (
          <span
            className={`mt-1 hidden whitespace-nowrap text-[11px] font-semibold tracking-[0.06em] sm:block ${
              dark ? "text-footer-text" : "text-ink-muted"
            }`}
          >
            Quà quê từ Bắc vào Nam
          </span>
        )}
      </span>
    </span>
  );
}
