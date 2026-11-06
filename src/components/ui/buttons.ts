// Các kiểu nút dùng chung. Dùng được trên <a> hoặc <button>:
//   <a href="/san-pham" className={`${btnBase} ${btnPrimary}`}>...</a>
//
// Mỗi chuỗi đặt các thuộc tính CSS KHÁC NHAU, nên chúng không bao giờ xung đột nhau.
// (Trong Tailwind, khi hai class đặt cùng một thuộc tính, thứ tự trong file CSS quyết định
// class nào thắng, chứ không phải thứ tự trong className. Vì vậy màu viền chỉ nằm trong các biến thể.)
export const btnBase =
  "inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-md border-2 px-6 font-semibold leading-none transition-colors duration-200";

export const btnPrimary = "border-transparent bg-primary text-white hover:bg-primary-dark";
export const btnSecondary = "border-primary bg-transparent text-primary hover:bg-primary-soft";
export const btnLight = "border-transparent bg-white text-primary hover:bg-primary-soft";
export const btnGhost =
  "border-transparent bg-transparent text-primary underline decoration-primary/30 decoration-2 underline-offset-[6px] hover:decoration-primary";

// Chữ nhỏ hơn: thêm sau biến thể
export const btnSmall = "text-sm";
