import type { CartItem, Product } from "@/types";

export const MAX_QUANTITY = 99; // tối đa cho mỗi sản phẩm trong giỏ
export const SHIPPING_FEE = 30000; // phí vận chuyển (VND) cho đơn dưới FREE_SHIPPING_MIN
export const FREE_SHIPPING_MIN = 300000; // tạm tính từ mức này trở lên thì miễn phí vận chuyển (VND)
export const DISCOUNT = 20000; // giảm giá cố định cho mọi đơn hàng (VND)

// Số lượng luôn là số nguyên từ 1 đến 99
export function cleanQuantity(value: number) {
  return Number.isFinite(value) ? Math.min(MAX_QUANTITY, Math.max(1, Math.floor(value))) : 1;
}

export type CartLine = { product: Product; quantity: number };

// Ghép mỗi mục trong giỏ với sản phẩm của nó. Bỏ qua các mục có sản phẩm không còn tồn tại.
export function getCartLines(cart: CartItem[], products: Product[]): CartLine[] {
  return cart.flatMap((item) => {
    const product = products.find((p) => p.id === item.productId);
    return product ? [{ product, quantity: item.quantity }] : [];
  });
}

// Phí vận chuyển của một đơn: miễn phí khi tạm tính đạt FREE_SHIPPING_MIN
export function shippingFeeFor(subtotal: number) {
  return subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
}

// Tạm tính + Phí vận chuyển − Giảm giá = Tổng cộng
// Đơn hàng lưu lại phí vận chuyển của chính nó, nên đổi các mức ở trên không làm đổi đơn cũ.
export function calculateTotals(subtotal: number) {
  const shippingFee = shippingFeeFor(subtotal);
  return { subtotal, shippingFee, discount: DISCOUNT, total: subtotal + shippingFee - DISCOUNT };
}
