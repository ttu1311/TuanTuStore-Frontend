// Mã giảm giá. Có hai nguồn:
// - Mã hộ chiếu PASSPORT_COUPON (cố định): khách đã đóng đủ PASSPORT_COUPON.stampsNeeded dấu trong "Hộ chiếu đặc sản".
// - Mã do chủ cửa hàng tạo ở /admin/ma-giam-gia (Coupon, lưu trong localStorage): giảm %, giảm số tiền, hoặc miễn phí vận chuyển.
// Quy tắc chung:
// - Phải đăng nhập; mỗi khách dùng mỗi mã một lần. Đơn đã hủy không tính, nên hủy đơn thì dùng lại được.
// - Mỗi đơn tối đa MỘT mã giảm giá (mã hộ chiếu cũng là mã giảm giá) và MỘT mã miễn phí vận chuyển.
// - Mã giảm giá THAY cho khoản giảm mặc định DISCOUNT của đơn đó.
// Trang thanh toán và placeOrder (StoreContext) đều tính qua applyCodes, nên hai nơi luôn ra cùng một con số.
import { DISCOUNT, calculateTotals } from "@/lib/cart";
import { formatVND } from "@/lib/format";
import { buildPassport } from "@/lib/passport";
import type { Coupon, CouponKind, Order, Product, User } from "@/types";

export const PASSPORT_COUPON = {
  code: "HOCHIEU50",
  percent: 50,
  maxDiscount: 200000, // giảm tối đa (VND) mỗi đơn
  stampsNeeded: 17,
} as const;

export const couponKindLabels: Record<CouponKind, string> = {
  PERCENT: "Giảm theo %",
  AMOUNT: "Giảm số tiền",
  FREE_SHIPPING: "Miễn phí vận chuyển",
};

// "tet 2027 " -> "TET2027"
export function normalizeCouponCode(text: string) {
  return text.replace(/\s+/g, "").toUpperCase();
}

// Số dấu khách đã đóng (tỉnh đã nhận hàng) và tổng số tỉnh trong hộ chiếu
export function passportProgress(products: Product[], orders: Order[], userId: string) {
  const stamps = buildPassport(products, orders, userId);
  return { stamped: stamps.filter((stamp) => stamp.state === "stamped").length, total: stamps.length };
}

// Các đơn (chưa hủy) đã dùng mã này
export function ordersUsingCode(orders: Order[], code: string) {
  return orders.filter((order) => order.status !== "CANCELLED" && (order.coupon === code || order.shippingCoupon === code));
}

// Đơn mà khách này đã dùng mã (nếu có)
export function orderUsingCodeBy(orders: Order[], userId: string, code: string) {
  return ordersUsingCode(orders, code).find((order) => order.userId === userId);
}

// "Giảm 30%, tối đa 100.000₫" / "Giảm 50.000₫" / "Miễn phí vận chuyển"
export function describeCoupon(coupon: Pick<Coupon, "kind" | "value" | "maxDiscount">) {
  if (coupon.kind === "FREE_SHIPPING") return "Miễn phí vận chuyển";
  if (coupon.kind === "AMOUNT") return `Giảm ${formatVND(coupon.value)}`;
  return `Giảm ${coupon.value}%` + (coupon.maxDiscount ? `, tối đa ${formatVND(coupon.maxDiscount)}` : "");
}

// Một mã khách có thể nhập: mã hộ chiếu, hoặc mã của chủ cửa hàng
function findCode(code: string, coupons: Coupon[]): Coupon | undefined {
  if (code === PASSPORT_COUPON.code) {
    return { code, kind: "PERCENT", value: PASSPORT_COUPON.percent, maxDiscount: PASSPORT_COUPON.maxDiscount, active: true, createdAt: "" };
  }
  return coupons.find((coupon) => coupon.code === code);
}

export type CouponContext = { user: User | null; products: Product[]; orders: Order[]; coupons: Coupon[]; subtotal: number };

// Lý do mã không dùng được cho đơn này (câu hiện cho khách), hoặc null nếu dùng được
export function codeProblem(code: string, { user, products, orders, coupons, subtotal }: CouponContext): string | null {
  const coupon = findCode(code, coupons);
  if (!coupon) return "Mã giảm giá không đúng.";
  if (!coupon.active) return "Mã này hiện đã ngừng áp dụng.";
  if (!user) return "Vui lòng đăng nhập để dùng mã giảm giá.";
  if (code === PASSPORT_COUPON.code) {
    const { stamped, total } = passportProgress(products, orders, user.id);
    if (stamped < PASSPORT_COUPON.stampsNeeded) {
      return `Mã này dành cho khách đã đóng đủ ${PASSPORT_COUPON.stampsNeeded} dấu trong Hộ chiếu đặc sản. Bạn đang có ${stamped}/${total} dấu.`;
    }
  }
  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
    return `Mã ${code} áp dụng cho đơn có tạm tính từ ${formatVND(coupon.minSubtotal)}.`;
  }
  const used = orderUsingCodeBy(orders, user.id, code);
  if (used) return `Bạn đã dùng mã này ở đơn ${used.code}.`;
  if (coupon.usageLimit && ordersUsingCode(orders, code).length >= coupon.usageLimit) return "Mã này đã hết lượt dùng.";
  return null;
}

// Có mã này không (mã hộ chiếu, hoặc mã cửa hàng đã tạo)
export function codeExists(code: string, coupons: Coupon[]) {
  return Boolean(findCode(code, coupons));
}

// Mã này thuộc ô nào của đơn: giảm giá hay miễn phí vận chuyển
export function codeSlot(code: string, coupons: Coupon[]): "discount" | "shipping" {
  return findCode(code, coupons)?.kind === "FREE_SHIPPING" ? "shipping" : "discount";
}

// Mô tả ngắn để hiện trên trang thanh toán
export function describeCode(code: string, coupons: Coupon[]) {
  const coupon = findCode(code, coupons);
  return coupon ? describeCoupon(coupon) : "";
}

// Số tiền một mã giảm giá trừ cho tạm tính này (không bao giờ quá tạm tính)
function discountOf(coupon: Coupon, subtotal: number) {
  const amount =
    coupon.kind === "PERCENT"
      ? Math.round((subtotal * coupon.value) / 100)
      : coupon.kind === "AMOUNT"
        ? coupon.value
        : 0;
  return Math.min(amount, coupon.maxDiscount ?? Infinity, subtotal);
}

export type AppliedCodes = { coupon?: string; shippingCoupon?: string };

// Kiểm tra các mã khách đã nhập và tính tiền. codes: tối đa một mã giảm giá và một mã miễn phí vận chuyển.
export function applyCodes(codes: AppliedCodes, context: CouponContext) {
  for (const code of [codes.coupon, codes.shippingCoupon]) {
    if (!code) continue;
    const problem = codeProblem(code, context);
    if (problem) return { ok: false as const, message: problem };
  }
  const discountCoupon = codes.coupon ? findCode(codes.coupon, context.coupons) : undefined;
  const discount = discountCoupon ? discountOf(discountCoupon, context.subtotal) : DISCOUNT;
  return { ok: true as const, totals: calculateTotals(context.subtotal, discount, Boolean(codes.shippingCoupon)) };
}

// ---------- Form tạo mã (Admin) ----------

export type CouponFormValues = {
  code: string;
  kind: CouponKind;
  value: string;
  maxDiscount: string;
  minSubtotal: string;
  usageLimit: string;
};

export type CouponFormErrors = Partial<Record<keyof CouponFormValues, string>>;

export const emptyCouponForm: CouponFormValues = { code: "", kind: "PERCENT", value: "", maxDiscount: "", minSubtotal: "", usageLimit: "" };

// "100.000" hoặc "100000" -> 100000; ô trống -> undefined
function parseNumber(text: string) {
  const digits = text.replace(/[.\s,₫đ]/gi, "");
  if (digits === "") return undefined;
  return /^\d+$/.test(digits) ? Number(digits) : NaN;
}

// Kiểm tra form; trả về lỗi theo từng ô, hoặc mã đã sẵn sàng để lưu
export function validateCouponForm(
  values: CouponFormValues,
  existing: Coupon[]
): { ok: false; errors: CouponFormErrors } | { ok: true; coupon: Coupon } {
  const errors: CouponFormErrors = {};
  const code = normalizeCouponCode(values.code);
  if (!code) errors.code = "Vui lòng nhập mã";
  else if (!/^[A-Z0-9]{3,20}$/.test(code)) errors.code = "Mã gồm 3–20 chữ cái không dấu hoặc chữ số";
  else if (code === PASSPORT_COUPON.code) errors.code = "Mã này dành riêng cho Hộ chiếu đặc sản";
  else if (existing.some((coupon) => coupon.code === code)) errors.code = "Mã này đã có";

  const value = parseNumber(values.value);
  if (values.kind === "PERCENT" && !(value !== undefined && Number.isInteger(value) && value >= 1 && value <= 100)) {
    errors.value = "Nhập số phần trăm từ 1 đến 100";
  }
  if (values.kind === "AMOUNT" && !(value !== undefined && value >= 1000)) errors.value = "Nhập số tiền từ 1.000₫ trở lên";

  const maxDiscount = values.kind === "PERCENT" ? parseNumber(values.maxDiscount) : undefined;
  if (maxDiscount !== undefined && !(maxDiscount >= 1000)) errors.maxDiscount = "Để trống, hoặc nhập từ 1.000₫ trở lên";
  const minSubtotal = parseNumber(values.minSubtotal);
  if (minSubtotal !== undefined && !(minSubtotal >= 0)) errors.minSubtotal = "Để trống, hoặc nhập số tiền";
  const usageLimit = parseNumber(values.usageLimit);
  if (usageLimit !== undefined && !(Number.isInteger(usageLimit) && usageLimit >= 1)) errors.usageLimit = "Để trống, hoặc nhập số lượt từ 1 trở lên";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    coupon: {
      code,
      kind: values.kind,
      value: values.kind === "FREE_SHIPPING" ? 0 : (value as number),
      ...(maxDiscount ? { maxDiscount } : {}),
      ...(minSubtotal ? { minSubtotal } : {}),
      ...(usageLimit ? { usageLimit } : {}),
      active: true,
      createdAt: new Date().toISOString(),
    },
  };
}
