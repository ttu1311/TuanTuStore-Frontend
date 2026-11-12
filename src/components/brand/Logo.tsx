// Logo "Đặc sản 3 Miền" (thiết kế do chủ cửa hàng cung cấp).
// Biểu tượng: chiếc bát đỏ rượu có hơi nước cuộn thành số 3, đôi đũa và nón lá vàng.
// Ảnh gốc đầy đủ (biểu tượng + chữ): public/brand/logo-full.webp. Phần biểu tượng đã tách nền (ảnh trong suốt,
// chỉ hai màu đỏ rượu và vàng): public/brand/mark.webp. Favicon: src/app/icon.png và apple-icon.png (biểu tượng trên nền kem).
// Chữ "ĐẶC SẢN 3 MIỀN" là chữ thật (font chữ có chân Lora, nạp ở src/app/layout.tsx), nên nét sắc ở mọi cỡ
// và đọc rõ trên điện thoại. Màu lấy từ chính hình logo: đỏ rượu, vàng.
// Các bản: <Logo /> cho header, <Logo tagline /> cho footer, <Logo size="sm" /> cho thanh bên trang Admin.

import Image from "next/image";

const brandColors = {
  crimson: "#830E20", // "ĐẶC SẢN", "MIỀN" (tương phản 10,3:1 trên nền sáng)
  gold: "#9A6A1E", // chữ "3" (4,7:1), vàng của logo đã đậm hơn một chút cho đủ rõ ở cỡ nhỏ
  brown: "#371C13", // dòng "TINH HOA ẨM THỰC VIỆT"
};

const wordmarkFont = 'var(--font-brand), Georgia, "Times New Roman", serif';

type LogoProps = {
  size?: "md" | "sm"; // sm: thanh bên trang Admin (chữ luôn xếp hai dòng cho vừa chỗ hẹp)
  tagline?: boolean; // dòng nhỏ "TINH HOA ẨM THỰC VIỆT" dưới tên (dùng ở footer)
  label?: string;
};

// Bản ngang: biểu tượng + tên. Điện thoại và thanh bên Admin xếp tên hai dòng ("ĐẶC SẢN" / "3 MIỀN"),
// màn hình từ cỡ sm trở lên xếp một dòng "ĐẶC SẢN 3 MIỀN".
export default function Logo({ size = "md", tagline = false, label = "Đặc sản 3 Miền — Tinh hoa ẩm thực Việt" }: LogoProps) {
  const small = size === "sm";

  return (
    <span role="img" aria-label={label} className="inline-flex items-center gap-2.5">
      {/* Ảnh cao 360px (tỉ lệ 291×360), hiển thị cao 38–56px nên vẫn nét trên màn hình Retina. Màn hình rộng: to hơn. */}
      <Image
        src="/brand/mark.webp"
        alt=""
        width={291}
        height={360}
        sizes="48px"
        className={`w-auto shrink-0 ${small ? "h-[38px]" : "h-12 sm:h-14"}`}
      />
      <span aria-hidden="true" className="flex flex-col">
        <span
          className={`flex font-bold leading-[1.02] tracking-[0.01em] ${
            small ? "flex-col text-[16px]" : "flex-col text-[17px] sm:flex-row sm:items-baseline sm:gap-[0.3em] sm:text-[24px]"
          }`}
          style={{ fontFamily: wordmarkFont, color: brandColors.crimson }}
        >
          <span>ĐẶC SẢN</span>
          <span>
            <span style={{ color: brandColors.gold }}>3</span> MIỀN
          </span>
        </span>
        {tagline && (
          <span
            className="mt-1 hidden whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.18em] sm:block"
            style={{ color: brandColors.brown }}
          >
            Tinh hoa ẩm thực Việt
          </span>
        )}
      </span>
    </span>
  );
}
